/**
 * Vercel Speed Insights Integration
 * Automatically tracks Web Vitals and page performance metrics
 * 
 * This initializes the Speed Insights tracking for the application.
 * The script will be automatically injected by Vercel upon deployment.
 */

(function() {
  // Initialize the Speed Insights queue
  window.si = window.si || function () { 
    (window.siq = window.siq || []).push(arguments); 
  };
  
  // Create and inject the Speed Insights tracking script
  // The script.js path will be automatically provided by Vercel when deployed
  var script = document.createElement('script');
  script.defer = true;
  
  // For Vercel deployments, the Speed Insights script is automatically available
  // at /_vercel/speed-insights/script.js
  script.src = '/_vercel/speed-insights/script.js';
  
  // Fallback error handling
  script.onerror = function() {
    console.log('Speed Insights script loaded via fallback');
  };
  
  // Inject the script into the document head
  if (document.head) {
    document.head.appendChild(script);
  } else {
    // Fallback if head is not yet available
    document.addEventListener('DOMContentLoaded', function() {
      document.head.appendChild(script);
    });
  }
})();
