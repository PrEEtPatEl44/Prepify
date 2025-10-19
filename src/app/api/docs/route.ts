import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

// GET /api/docs
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const documentType = searchParams.get("type");

    if (documentType !== "resumes" && documentType !== "coverLetters") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Bad Request",
          message: "Invalid document type",
        }),
        { status: 400 }
      );
    }

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized",
          message: "User not authenticated. Please log in.",
        }),
        { status: 401 }
      );
    }

    // Query only id, file_name, and file_path from the specified table
    const tableName = documentType === "resumes" ? "resumes" : "cover_letters";
    const { data, error: queryError } = await supabase
      .from(tableName)
      .select("id, file_name, file_path")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (queryError) {
      console.error("Database query error:", queryError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Database Error",
          message: `Database query failed: ${queryError.message}`,
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: data || [],
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/docs error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal Server Error",
        message: `Failed to fetch documents info: ${errorMessage}`,
      }),
      { status: 500 }
    );
  }
}

// POST /api/docs - Upload file and create document record
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized",
          message: "User not authenticated. Please log in.",
        }),
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;
    const documentType = formData.get("documentType") as string;

    // Validate inputs
    if (!file || !fileName || !documentType) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Bad Request",
          message: "Missing required fields: file, fileName, or documentType",
        }),
        { status: 400 }
      );
    }

    if (documentType !== "resumes" && documentType !== "coverLetters") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Bad Request",
          message: "Invalid document type. Must be 'resumes' or 'coverLetters'",
        }),
        { status: 400 }
      );
    }

    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const sanitizedFileName = fileName.trim().replace(/[^a-zA-Z0-9-_]/g, "_");
    const storageFileName = `${user.id}/${documentType}/${timestamp}_${sanitizedFileName}.${fileExtension}`;

    // Step 1: Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storageFileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Storage Error",
          message: `Storage upload failed: ${uploadError.message}`,
        }),
        { status: 500 }
      );
    }

    // Get signed URL for the uploaded file
    const { data: urlData } = await supabase.storage
      .from("documents")
      .createSignedUrl(uploadData.path, 60 * 60 * 24 * 7); // 7 days expiry

    const uploadedFileUrl = urlData?.signedUrl;

    if (!uploadedFileUrl) {
      // Clean up uploaded file if URL generation fails
      await supabase.storage.from("documents").remove([uploadData.path]);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Storage Error",
          message: "Failed to generate file URL",
        }),
        { status: 500 }
      );
    }

    // Step 2: Insert record into database
    const tableName = documentType === "resumes" ? "resumes" : "cover_letters";
    const { data: dbData, error: insertError } = await supabase
      .from(tableName)
      .insert({
        user_id: user.id,
        file_path: uploadData.path,
        file_name: fileName.trim(),
        file_size: file.size,
        mime_type: file.type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      // Clean up uploaded file if database insert fails
      await supabase.storage.from("documents").remove([uploadData.path]);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Database Error",
          message: `Database insert failed: ${insertError.message}`,
        }),
        { status: 500 }
      );
    }

    // Revalidate the docs page to show the new file
    revalidatePath("/docs");

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: dbData.id,
          url: uploadedFileUrl,
          filePath: uploadData.path,
        },
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/docs error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal Server Error",
        message: `Failed to upload document: ${errorMessage}`,
      }),
      { status: 500 }
    );
  }
}
