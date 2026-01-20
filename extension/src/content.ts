/**
 * Content script for Pinstr extension.
 * Extracts page metadata when requested by the popup.
 */

interface PageMetadata {
  url: string;
  title: string;
  description: string;
}

function getPageMetadata(): PageMetadata {
  // Get URL
  const url = window.location.href;

  // Get title
  const title = document.title || "";

  // Get description from meta tags
  let description = "";

  // Try og:description first
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    description = ogDescription.getAttribute("content") || "";
  }

  // Fall back to meta description
  if (!description) {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      description = metaDescription.getAttribute("content") || "";
    }
  }

  // Fall back to twitter:description
  if (!description) {
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      description = twitterDescription.getAttribute("content") || "";
    }
  }

  return { url, title, description };
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "GET_PAGE_METADATA") {
    const metadata = getPageMetadata();
    sendResponse(metadata);
  }
  return true; // Keep the message channel open for async response
});
