export function generateProxyScript(hostname: string): string {
  return `
    <script>
      console.log('Ultra-aggressive proxy scripts loaded for ${hostname}');
      
      // Override ALL possible iframe detection methods
      try {
        // Lock down window properties completely
        Object.defineProperty(window, 'top', {
          get: function() { return window; },
          set: function() { return false; },
          configurable: false,
          enumerable: false
        });
        Object.defineProperty(window, 'parent', {
          get: function() { return window; },
          set: function() { return false; },
          configurable: false,
          enumerable: false
        });
        Object.defineProperty(window, 'frameElement', {
          get: function() { return null; },
          set: function() { return false; },
          configurable: false,
          enumerable: false
        });
        Object.defineProperty(window, 'frames', {
          get: function() { return window; },
          configurable: false
        });
        
        // Override self and top globally
        window.self = window;
        window.top = window;
        window.parent = window;
        
      } catch(e) {
        console.log('Error overriding window properties:', e);
      }
      
      // Prevent ALL navigation and redirect attempts
      const originalLocation = window.location;
      
      // Override location methods
      ['assign', 'replace', 'reload'].forEach(method => {
        const original = window.location[method];
        window.location[method] = function(url) {
          console.log('Blocked location.' + method + ':', url);
          if (url && url !== window.location.href) {
            window.parent.postMessage({type: 'navigate', url: url}, '*');
          }
          return false;
        };
      });
      
      // Override href setter
      Object.defineProperty(window.location, 'href', {
        set: function(url) {
          console.log('Blocked location.href:', url);
          if (url && url !== window.location.href) {
            window.parent.postMessage({type: 'navigate', url: url}, '*');
          }
        },
        get: function() {
          return originalLocation.href;
        }
      });
      
      // Override window.open
      window.open = function(url, target, features) {
        console.log('Blocked window.open:', url);
        if (url) {
          window.parent.postMessage({type: 'navigate', url: url}, '*');
        }
        return null;
      };
      
      // Prevent form redirects
      document.addEventListener('submit', function(e) {
        const form = e.target;
        if (form && form.action) {
          e.preventDefault();
          console.log('Blocked form submission to:', form.action);
          if (form.method && form.method.toLowerCase() === 'get') {
            const formData = new FormData(form);
            const params = new URLSearchParams(formData);
            const url = form.action + (form.action.includes('?') ? '&' : '?') + params.toString();
            window.parent.postMessage({type: 'navigate', url: url}, '*');
          }
          return false;
        }
      }, true);
      
      // Enhanced link interception
      function interceptClicks(e) {
        const link = e.target.closest('a, [onclick], button[type="submit"]');
        if (link) {
          if (link.tagName === 'A' && link.href && !link.href.startsWith('javascript:') && !link.href.startsWith('#')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('Intercepted link click:', link.href);
            window.parent.postMessage({type: 'navigate', url: link.href}, '*');
            return false;
          }
          
          // Handle onclick events
          if (link.onclick) {
            const originalOnClick = link.onclick;
            link.onclick = function(event) {
              event.preventDefault();
              event.stopPropagation();
              console.log('Blocked onclick event');
              return false;
            };
          }
        }
      }
      
      document.addEventListener('click', interceptClicks, true);
      document.addEventListener('mousedown', interceptClicks, true);
      
      // Watch for dynamically added content
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(function(node) {
              if (node.nodeType === 1) {
                // Handle links and buttons in new content
                const links = node.querySelectorAll ? node.querySelectorAll('a, [onclick], button') : [];
                links.forEach(function(link) {
                  link.addEventListener('click', interceptClicks, true);
                  link.addEventListener('mousedown', interceptClicks, true);
                });
              }
            });
          }
        });
      });
      
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      }
      
      console.log('All proxy protections initialized for ${hostname}');
    </script>
  `
}