import React from "react";

interface SearchResultsDockProps {
  searchTerm: string;
  filteredCount: number;
  totalCount: number;
  itemType?: string; // e.g., "job", "result", "document"
}

const SearchResultsDock = ({
  searchTerm,
  filteredCount,
  totalCount,
  itemType = "result",
}: SearchResultsDockProps) => {
  // Only show when search is active and there are items
  if (!searchTerm || !searchTerm.trim() || totalCount === 0) {
    return null;
  }

  const pluralize = (count: number, singular: string) => {
    return count === 1 ? singular : `${singular}s`;
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 bg-white border border-gray-300 rounded-full shadow-lg backdrop-blur-sm bg-opacity-95 animate-in slide-in-from-bottom duration-300">
      <p className="text-sm text-gray-700 whitespace-nowrap">
        {filteredCount > 0 ? (
          <>
            Showing{" "}
            <span className="font-semibold text-blue-600">{filteredCount}</span>{" "}
            of <span className="font-semibold text-gray-900">{totalCount}</span>{" "}
            {pluralize(totalCount, itemType)}
            <span className="ml-1">
              for &quot;
              <span className="font-medium text-gray-900">{searchTerm}</span>
              &quot;
            </span>
          </>
        ) : (
          <>
            <span className="font-semibold text-orange-600">
              No results found
            </span>{" "}
            for &quot;
            <span className="font-medium text-gray-900">{searchTerm}</span>
            &quot;
          </>
        )}
      </p>
    </div>
  );
};

export default SearchResultsDock;
