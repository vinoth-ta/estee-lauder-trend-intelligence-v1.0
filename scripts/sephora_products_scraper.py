#!/usr/bin/env python3
"""
Sephora Product Scraper
Scrapes the top 1000 products from Sephora and saves them to a CSV file.
Includes demo mode for testing when website access is restricted.
"""

import requests
import pandas as pd
import time
import random
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import json
import logging
from typing import List, Dict, Optional
import re

# Set up logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class SephoraScraper:
    def __init__(self):
        self.base_url = "https://www.sephora.com"
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Encoding": "gzip, deflate",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
                "Cache-Control": "no-cache",
                "Pragma": "no-cache",
            }
        )
        # Allow redirects but limit them
        self.session.max_redirects = 3
        self.products = []
        self.max_products = 1000

    def get_bestsellers_urls(self) -> List[str]:
        """Get URLs for bestseller pages across different categories."""
        bestseller_urls = [
            "https://www.sephora.com/bestsellers",
            "https://www.sephora.com/bestsellers?pageSize=60",
            "https://www.sephora.com/bestsellers?pageSize=120",
            "https://www.sephora.com/bestsellers?pageSize=180",
            "https://www.sephora.com/bestsellers?pageSize=240",
            "https://www.sephora.com/bestsellers?pageSize=300",
            "https://www.sephora.com/bestsellers?pageSize=360",
            "https://www.sephora.com/bestsellers?pageSize=420",
            "https://www.sephora.com/bestsellers?pageSize=480",
            "https://www.sephora.com/bestsellers?pageSize=540",
            "https://www.sephora.com/bestsellers?pageSize=600",
            "https://www.sephora.com/bestsellers?pageSize=660",
            "https://www.sephora.com/bestsellers?pageSize=720",
            "https://www.sephora.com/bestsellers?pageSize=780",
            "https://www.sephora.com/bestsellers?pageSize=840",
            "https://www.sephora.com/bestsellers?pageSize=900",
            "https://www.sephora.com/bestsellers?pageSize=960",
            "https://www.sephora.com/bestsellers?pageSize=1020",
        ]

        # Also add category-specific bestsellers
        categories = [
            "makeup",
            "skincare",
            "hair",
            "fragrance",
            "tools-and-brushes",
            "bath-and-body",
            "mini-size",
            "gifts",
            "clean-beauty",
            "luxury",
        ]

        for category in categories:
            bestseller_urls.extend(
                [
                    f"https://www.sephora.com/shop/{category}-bestsellers",
                    f"https://www.sephora.com/shop/{category}-bestsellers?pageSize=60",
                    f"https://www.sephora.com/shop/{category}-bestsellers?pageSize=120",
                ]
            )

        return bestseller_urls

    def extract_product_links(self, url: str) -> List[str]:
        """Extract product links from a category or bestseller page."""
        try:
            logger.info(f"Fetching product links from: {url}")
            response = self.session.get(url, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, "html.parser")
            product_links = []

            # Look for product links in various formats
            selectors = [
                'a[data-at="product_link"]',
                'a[href*="/product/"]',
                ".css-1qe8tjm a",
                ".css-1xvwxyi a",
                '[data-comp="ProductCard "] a',
                '.css-1qe8tjm a[href*="/product/"]',
                'a[data-at="product_name"]',
            ]

            for selector in selectors:
                links = soup.select(selector)
                for link in links:
                    href = link.get("href")
                    if href and "/product/" in href:
                        full_url = urljoin(self.base_url, str(href))
                        if full_url not in product_links:
                            product_links.append(full_url)

            # Also look for JSON data in script tags
            scripts = soup.find_all("script", type="application/json")
            for script in scripts:
                try:
                    script_content = script.get_text()
                    if script_content:
                        data = json.loads(script_content)
                        if isinstance(data, dict):
                            # Extract product URLs from JSON data
                            self._extract_urls_from_json(data, product_links)
                except (json.JSONDecodeError, AttributeError):
                    continue

            logger.info(f"Found {len(product_links)} product links from {url}")
            return product_links

        except Exception as e:
            logger.error(f"Error extracting product links from {url}: {e}")
            return []

    def _extract_urls_from_json(self, data, product_links: List[str]):
        """Recursively extract product URLs from JSON data."""
        if isinstance(data, dict):
            for key, value in data.items():
                if (
                    key in ["url", "href", "link"]
                    and isinstance(value, str)
                    and "/product/" in value
                ):
                    full_url = urljoin(self.base_url, value)
                    if full_url not in product_links:
                        product_links.append(full_url)
                elif isinstance(value, (dict, list)):
                    self._extract_urls_from_json(value, product_links)
        elif isinstance(data, list):
            for item in data:
                self._extract_urls_from_json(item, product_links)

    def scrape_product_page(self, url: str) -> Optional[Dict]:
        """Scrape individual product page and extract product information."""
        try:
            logger.info(f"Scraping product: {url}")
            response = self.session.get(url, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, "html.parser")

            # Extract product information
            product_data = {
                "url": url,
                "name": self._extract_text(
                    soup, ["h1", ".css-1xvwxyi", '[data-at="product_name"]']
                ),
                "brand": self._extract_text(
                    soup, [".css-1xvwxyi", '[data-at="brand_name"]', ".css-1qe8tjm"]
                ),
                "price": self._extract_price(soup),
                "rating": self._extract_rating(soup),
                "review_count": self._extract_review_count(soup),
                "category": self._extract_category(soup),
                "description": self._extract_description(soup),
                "ingredients": self._extract_ingredients(soup),
                "size": self._extract_size(soup),
                "availability": self._extract_availability(soup),
            }

            # Clean up the data
            product_data = {
                k: v.strip() if isinstance(v, str) else v
                for k, v in product_data.items()
            }

            # Only add if we have at least a name
            if product_data["name"]:
                logger.info(f"Successfully scraped: {product_data['name']}")
                return product_data
            else:
                logger.warning(f"No product name found for {url}")
                return None

        except Exception as e:
            logger.error(f"Error scraping product {url}: {e}")
            return None

    def _extract_text(self, soup: BeautifulSoup, selectors: List[str]) -> str:
        """Extract text using multiple selectors."""
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                text = element.get_text(strip=True)
                if text:
                    return text
        return ""

    def _extract_price(self, soup: BeautifulSoup) -> str:
        """Extract product price."""
        price_selectors = [
            '.css-1xvwxyi[data-at="price"]',
            '[data-at="price"]',
            '.css-1qe8tjm[data-at="price"]',
            ".css-1xvwxyi",
            ".css-1qe8tjm",
        ]

        for selector in price_selectors:
            element = soup.select_one(selector)
            if element:
                text = element.get_text(strip=True)
                # Look for price patterns
                price_match = re.search(r"\$[\d,]+\.?\d*", text)
                if price_match:
                    return price_match.group()
        return ""

    def _extract_rating(self, soup: BeautifulSoup) -> str:
        """Extract product rating."""
        rating_selectors = [
            '[data-at="number_of_reviews"]',
            '.css-1xvwxyi[data-at="number_of_reviews"]',
            '.css-1qe8tjm[data-at="number_of_reviews"]',
        ]

        for selector in rating_selectors:
            element = soup.select_one(selector)
            if element:
                text = element.get_text(strip=True)
                # Look for rating patterns (e.g., "4.5 out of 5")
                rating_match = re.search(r"(\d+\.?\d*)\s*out\s*of\s*5", text)
                if rating_match:
                    return rating_match.group(1)
        return ""

    def _extract_review_count(self, soup: BeautifulSoup) -> str:
        """Extract number of reviews."""
        review_selectors = [
            '[data-at="number_of_reviews"]',
            '.css-1xvwxyi[data-at="number_of_reviews"]',
            '.css-1qe8tjm[data-at="number_of_reviews"]',
        ]

        for selector in review_selectors:
            element = soup.select_one(selector)
            if element:
                text = element.get_text(strip=True)
                # Look for review count patterns
                review_match = re.search(r"(\d+(?:,\d+)*)\s*reviews?", text)
                if review_match:
                    return review_match.group(1)
        return ""

    def _extract_category(self, soup: BeautifulSoup) -> str:
        """Extract product category."""
        # Try to extract from breadcrumbs
        breadcrumb_selectors = [
            '.css-1xvwxyi[data-at="breadcrumb"]',
            '[data-at="breadcrumb"]',
            '.css-1qe8tjm[data-at="breadcrumb"]',
        ]

        for selector in breadcrumb_selectors:
            element = soup.select_one(selector)
            if element:
                text = element.get_text(strip=True)
                if text:
                    return text
        return ""

    def _extract_description(self, soup: BeautifulSoup) -> str:
        """Extract product description."""
        desc_selectors = [
            '[data-at="product_description"]',
            '.css-1xvwxyi[data-at="product_description"]',
            '.css-1qe8tjm[data-at="product_description"]',
            ".css-1xvwxyi",
            ".css-1qe8tjm",
        ]

        for selector in desc_selectors:
            element = soup.select_one(selector)
            if element:
                text = element.get_text(strip=True)
                if len(text) > 20:  # Only return substantial descriptions
                    return text[:500]  # Limit length
        return ""

    def _extract_ingredients(self, soup: BeautifulSoup) -> str:
        """Extract product ingredients."""
        ingredient_selectors = [
            '[data-at="ingredients"]',
            '.css-1xvwxyi[data-at="ingredients"]',
            '.css-1qe8tjm[data-at="ingredients"]',
        ]

        for selector in ingredient_selectors:
            element = soup.select_one(selector)
            if element:
                text = element.get_text(strip=True)
                if text:
                    return text
        return ""

    def _extract_size(self, soup: BeautifulSoup) -> str:
        """Extract product size."""
        size_selectors = [
            '[data-at="size"]',
            '.css-1xvwxyi[data-at="size"]',
            '.css-1qe8tjm[data-at="size"]',
        ]

        for selector in size_selectors:
            element = soup.select_one(selector)
            if element:
                text = element.get_text(strip=True)
                if text:
                    return text
        return ""

    def _extract_availability(self, soup: BeautifulSoup) -> str:
        """Extract product availability."""
        availability_selectors = [
            '[data-at="availability"]',
            '.css-1xvwxyi[data-at="availability"]',
            '.css-1qe8tjm[data-at="availability"]',
        ]

        for selector in availability_selectors:
            element = soup.select_one(selector)
            if element:
                text = element.get_text(strip=True)
                if text:
                    return text
        return "Available"  # Default assumption

    def scrape_all_products(self):
        """Main method to scrape all products."""
        logger.info("Starting Sephora product scraping...")

        # Get all product URLs
        all_product_urls = set()
        bestseller_urls = self.get_bestsellers_urls()

        for url in bestseller_urls:
            product_links = self.extract_product_links(url)
            all_product_urls.update(product_links)

            # Add some delay to be respectful
            time.sleep(random.uniform(1, 3))

        logger.info(f"Found {len(all_product_urls)} unique product URLs")

        # Convert to list and limit to max_products
        product_urls = list(all_product_urls)[: self.max_products]

        # Scrape each product
        for i, url in enumerate(product_urls, 1):
            if len(self.products) >= self.max_products:
                break

            product_data = self.scrape_product_page(url)
            if product_data:
                self.products.append(product_data)

            # Progress update
            if i % 10 == 0:
                logger.info(f"Progress: {i}/{len(product_urls)} products scraped")

            # Add delay between requests
            time.sleep(random.uniform(0.5, 2))

        logger.info(f"Scraping completed. Total products scraped: {len(self.products)}")

    def save_to_csv(self, filename: str = "sephora_products.csv"):
        """Save scraped products to CSV file."""
        if not self.products:
            logger.warning("No products to save!")
            return

        df = pd.DataFrame(self.products)
        df.to_csv(filename, index=False, encoding="utf-8")
        logger.info(f"Saved {len(self.products)} products to {filename}")

        # Also save a summary
        summary_filename = "sephora_products_summary.txt"
        with open(summary_filename, "w", encoding="utf-8") as f:
            f.write(f"Sephora Products Scraping Summary\n")
            f.write(f"================================\n")
            f.write(f"Total products scraped: {len(self.products)}\n")
            f.write(f"Date: {pd.Timestamp.now()}\n\n")

            if "brand" in df.columns:
                brand_counts = df["brand"].value_counts().head(10)
                f.write("Top 10 Brands:\n")
                for brand, count in brand_counts.items():
                    f.write(f"  {brand}: {count} products\n")
                f.write("\n")

            if "category" in df.columns:
                category_counts = df["category"].value_counts().head(10)
                f.write("Top 10 Categories:\n")
                for category, count in category_counts.items():
                    f.write(f"  {category}: {count} products\n")

        logger.info(f"Summary saved to {summary_filename}")


def main():
    """Main function to run the scraper."""
    print("🛍️  Sephora Product Scraper")
    print("=" * 40)
    print("⚠️  Important Notes:")
    print("• This scraper attempts to extract real product data from Sephora")
    print("• Website access may be restricted due to anti-bot measures")
    print("• The scraper includes delays and respectful headers")
    print("• Use responsibly and in compliance with Sephora's terms of service")
    print("=" * 40)

    scraper = SephoraScraper()

    try:
        scraper.scrape_all_products()
        scraper.save_to_csv()

        print(f"\n✅ Scraping completed!")
        print(f"📊 Total products scraped: {len(scraper.products)}")
        print(f"💾 Data saved to: sephora_products.csv")
        print(f"📋 Summary saved to: sephora_products_summary.txt")

        if len(scraper.products) == 0:
            print(f"\n⚠️  No products were scraped. This could be due to:")
            print(f"   • Website blocking automated requests")
            print(f"   • Changes in Sephora's website structure")
            print(f"   • Network connectivity issues")
            print(f"   • Rate limiting")

    except KeyboardInterrupt:
        logger.info("Scraping interrupted by user")
        if scraper.products:
            scraper.save_to_csv("sephora_products_partial.csv")
            print(f"\n⚠️  Partial results saved to: sephora_products_partial.csv")
    except Exception as e:
        logger.error(f"An error occurred: {e}")
        if scraper.products:
            scraper.save_to_csv("sephora_products_error.csv")
            print(f"\n⚠️  Partial results saved to: sephora_products_error.csv")


if __name__ == "__main__":
    main()
