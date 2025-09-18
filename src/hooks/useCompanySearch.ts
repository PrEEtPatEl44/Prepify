import { useState, useEffect } from 'react';

export interface CompanyResult {
  name: string;
  domain: string;
  logoUrl: string;
  description?: string;
}

export const useCompanySearch = () => {
  const [results, setResults] = useState<CompanyResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fallback company data when API fails or for development
  const fallbackCompanies: CompanyResult[] = [
    { name: "Google", domain: "google.com", logoUrl: "https://cdn.brandfetch.io/google.com?c=1idy7WQ5YtpRvbd1DQy" },
    { name: "Microsoft", domain: "microsoft.com", logoUrl: "https://cdn.brandfetch.io/microsoft.com?c=1idy7WQ5YtpRvbd1DQy" },
    { name: "Apple", domain: "apple.com", logoUrl: "https://cdn.brandfetch.io/apple.com?c=1idy7WQ5YtpRvbd1DQy" },
    { name: "Amazon", domain: "amazon.com", logoUrl: "https://cdn.brandfetch.io/amazon.com?c=1idy7WQ5YtpRvbd1DQy" },
    { name: "Meta", domain: "meta.com", logoUrl: "https://cdn.brandfetch.io/meta.com?c=1idy7WQ5YtpRvbd1DQy" },
    { name: "Netflix", domain: "netflix.com", logoUrl: "https://cdn.brandfetch.io/netflix.com?c=1idy7WQ5YtpRvbd1DQy" },
    { name: "Tesla", domain: "tesla.com", logoUrl: "https://cdn.brandfetch.io/tesla.com?c=1idy7WQ5YtpRvbd1DQy" },
    { name: "Uber", domain: "uber.com", logoUrl: "https://cdn.brandfetch.io/uber.com?c=1idy7WQ5YtpRvbd1DQy" },
    { name: "Airbnb", domain: "airbnb.com", logoUrl: "https://cdn.brandfetch.io/airbnb.com?c=1idy7WQ5YtpRvbd1DQy" },
    { name: "Shopify", domain: "shopify.com", logoUrl: "https://cdn.brandfetch.io/shopify.com?c=1idy7WQ5YtpRvbd1DQy" },
    { name: "Spotify", domain: "spotify.com", logoUrl: "https://cdn.brandfetch.io/spotify.com?c=1idy7WQ5YtpRvbd1DQy" },
    { name: "Adobe", domain: "adobe.com", logoUrl: "https://cdn.brandfetch.io/adobe.com?c=1idy7WQ5YtpRvbd1DQy" },
    { name: "Salesforce", domain: "salesforce.com", logoUrl: "https://cdn.brandfetch.io/salesforce.com?c=1idy7WQ5YtpRvbd1DQy" },
    { name: "OpenAI", domain: "openai.com", logoUrl: "https://cdn.brandfetch.io/openai.com?c=1idy7WQ5YtpRvbd1DQy" },
    { name: "Stripe", domain: "stripe.com", logoUrl: "https://cdn.brandfetch.io/stripe.com?c=1idy7WQ5YtpRvbd1DQy" }
  ];

  const searchCompanies = async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First try with fallback companies (filtered by query)
      const filteredFallbacks = fallbackCompanies.filter(company =>
        company.name.toLowerCase().includes(query.toLowerCase())
      );

      // Try BrandFetch API (you'll need to replace YOUR_API_KEY with actual key)
      const brandfetchResults = await fetchFromBrandFetch(query);
      
      // Combine results, prioritizing BrandFetch if available
      const combinedResults = brandfetchResults.length > 0 
        ? [...brandfetchResults, ...filteredFallbacks.slice(0, 3)]
        : filteredFallbacks;

      // Remove duplicates and limit results
      const uniqueResults = combinedResults
        .filter((result, index, self) => 
          index === self.findIndex(r => r.domain === result.domain)
        )
        .slice(0, 8);

      setResults(uniqueResults);
    } catch (err) {
      console.error('Company search error:', err);
      setError('Failed to search companies');
      
      // Fallback to local results only
      const filteredFallbacks = fallbackCompanies.filter(company =>
        company.name.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filteredFallbacks);
    } finally {
      setLoading(false);
    }
  };

  const fetchFromBrandFetch = async (query: string): Promise<CompanyResult[]> => {
    try {
      // Note: You'll need to sign up for BrandFetch API and get an API key
      // For now, we'll use a mock implementation
      
      // Uncomment and modify this when you have a BrandFetch API key:
      /*
      const response = await fetch(`https://api.brandfetch.io/v2/search/${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': 'Bearer YOUR_API_KEY_HERE',
        }
      });

      if (!response.ok) throw new Error('BrandFetch API failed');

      const data = await response.json();
      return data.map((item: any) => ({
        name: item.name,
        domain: item.domain,
        logoUrl: item.icon || item.logo,
        description: item.description
      }));
      */

      // Mock delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Return empty array to use fallback data
      return [];
    } catch (error) {
      console.warn('BrandFetch API unavailable, using fallback data');
      return [];
    }
  };

  return {
    results,
    loading,
    error,
    searchCompanies,
    clearResults: () => setResults([])
  };
};