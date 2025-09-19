import { useState } from "react";

export interface CompanySearchResult {
  brandId: string;
  name: string;
  domain: string;
  icon: string;
  _score: number;
}

export const useCompanySearch = () => {
  const [results, setResults] = useState<CompanySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fallback company data when API fails or for development
  const fallbackCompanies: CompanySearchResult[] = [
    {
      brandId: "google",
      name: "Google",
      domain: "google.com",
      icon: "https://cdn.brandfetch.io/google.com?c=1idy7WQ5YtpRvbd1DQy",
      _score: 1,
    },
    {
      brandId: "microsoft",
      name: "Microsoft",
      domain: "microsoft.com",
      icon: "https://cdn.brandfetch.io/microsoft.com?c=1idy7WQ5YtpRvbd1DQy",
      _score: 1,
    },
    {
      brandId: "apple",
      name: "Apple",
      domain: "apple.com",
      icon: "https://cdn.brandfetch.io/apple.com?c=1idy7WQ5YtpRvbd1DQy",
      _score: 1,
    },
    {
      brandId: "amazon",
      name: "Amazon",
      domain: "amazon.com",
      icon: "https://cdn.brandfetch.io/amazon.com?c=1idy7WQ5YtpRvbd1DQy",
      _score: 1,
    },
    {
      brandId: "meta",
      name: "Meta",
      domain: "meta.com",
      icon: "https://cdn.brandfetch.io/meta.com?c=1idy7WQ5YtpRvbd1DQy",
      _score: 1,
    },
    {
      brandId: "netflix",
      name: "Netflix",
      domain: "netflix.com",
      icon: "https://cdn.brandfetch.io/netflix.com?c=1idy7WQ5YtpRvbd1DQy",
      _score: 1,
    },
    {
      brandId: "tesla",
      name: "Tesla",
      domain: "tesla.com",
      icon: "https://cdn.brandfetch.io/tesla.com?c=1idy7WQ5YtpRvbd1DQy",
      _score: 1,
    },
    {
      brandId: "uber",
      name: "Uber",
      domain: "uber.com",
      icon: "https://cdn.brandfetch.io/uber.com?c=1idy7WQ5YtpRvbd1DQy",
      _score: 1,
    },
    {
      brandId: "airbnb",
      name: "Airbnb",
      domain: "airbnb.com",
      icon: "https://cdn.brandfetch.io/airbnb.com?c=1idy7WQ5YtpRvbd1DQy",
      _score: 1,
    },
    {
      brandId: "shopify",
      name: "Shopify",
      domain: "shopify.com",
      icon: "https://cdn.brandfetch.io/shopify.com?c=1idy7WQ5YtpRvbd1DQy",
      _score: 1,
    },
    {
      brandId: "spotify",
      name: "Spotify",
      domain: "spotify.com",
      icon: "https://cdn.brandfetch.io/spotify.com?c=1idy7WQ5YtpRvbd1DQy",
      _score: 1,
    },
    {
      brandId: "adobe",
      name: "Adobe",
      domain: "adobe.com",
      icon: "https://cdn.brandfetch.io/adobe.com?c=1idy7WQ5YtpRvbd1DQy",
      _score: 1,
    },
    {
      brandId: "salesforce",
      name: "Salesforce",
      domain: "salesforce.com",
      icon: "https://cdn.brandfetch.io/salesforce.com?c=1idy7WQ5YtpRvbd1DQy",
      _score: 1,
    },
    {
      brandId: "openai",
      name: "OpenAI",
      domain: "openai.com",
      icon: "https://cdn.brandfetch.io/openai.com?c=1idy7WQ5YtpRvbd1DQy",
      _score: 1,
    },
    {
      brandId: "stripe",
      name: "Stripe",
      domain: "stripe.com",
      icon: "https://cdn.brandfetch.io/stripe.com?c=1idy7WQ5YtpRvbd1DQy",
      _score: 1,
    },
  ];

  const searchCompanies = async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch from BrandFetch API
      const results = await fetchFromBrandFetch(query);

      // If BrandFetch fails, use fallback data
      if (results.length === 0) {
        const fallbackResults = fallbackCompanies.filter((company) =>
          company.name.toLowerCase().includes(query.toLowerCase())
        );
        setResults(fallbackResults);
        setLoading(false);
        return;
      }

      setResults(results);
    } catch (err) {
      console.error("Company search error:", err);
      setError("Failed to search companies");

      setResults(results);
    } finally {
      setLoading(false);
    }
  };

  const fetchFromBrandFetch = async (
    query: string
  ): Promise<CompanySearchResult[]> => {
    try {
      // add the BRANDFETCH_CLIENT_ID in the .env file by siningup for brandfetch api
      // signup: https://developers.brandfetch.com/register
      // public client id at https://developers.brandfetch.com/dashboard/brand-search-api

      const response = await fetch(
        `https://api.brandfetch.io/v2/search/${encodeURIComponent(query)}?c=${
          process.env.BRANDFETCH_CLIENT_ID
        }`
      );

      if (!response.ok) throw new Error("BrandFetch API failed");

      const data = await response.json();
      console.log("BrandFetch API data:", data);
      const results: CompanySearchResult[] = data.map(
        (item: CompanySearchResult) => ({
          brandId: item.brandId,
          name: item.name,
          domain: item.domain,
          icon: item.icon,
          _score: item._score,
        })
      );
      console.log("BrandFetch results:", results);
      return results;

      // Return empty array to use fallback data
      return [];
    } catch (error) {
      console.error("BrandFetch API error:", error);
      return [];
    }
  };

  return {
    results,
    loading,
    error,
    searchCompanies,
    clearResults: () => setResults([]),
  };
};
