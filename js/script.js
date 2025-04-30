// Select DOM elements
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const button = document.querySelector('button');
const gallery = document.getElementById('gallery');

// NASA API key and base URL
const apiKey = 'xkOYl02jQKkPTmk8HQkCqwE5nGLf9IaYPxCU5yln'; // Replace with your actual API key
const apiUrl = 'https://api.nasa.gov/planetary/apod';

// NASA's APOD API only has images from June 16, 1995 onwards
const earliestDate = '1995-06-16';

// Get today's date in YYYY-MM-DD format (required by date inputs)
const today = new Date().toISOString().split('T')[0];

function setupDateInputs(startInput, endInput) {
  // Restrict date selection range from NASA's first image to today
  startInput.min = earliestDate;
  startInput.max = today;
  endInput.min = earliestDate;
  endInput.max = today;

  // Default: Show the most recent 9 days of space images
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 8); // minus 8 because it includes today
  startInput.value = lastWeek.toISOString().split('T')[0];
  endInput.value = today;

  // Automatically adjust end date to show exactly 9 days of images
  startInput.addEventListener('change', () => {
    const startDate = new Date(startInput.value);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 8);
    endInput.value = endDate > new Date(today) ? today : endDate.toISOString().split('T')[0];
  });
}

// Call the setupDateInputs function to initialize the date inputs
setupDateInputs(startDateInput, endDateInput);

// Function to fetch and display images
const fetchImages = async () => {
  // Get the selected date range
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  // Validate date inputs
  if (!startDate || !endDate) {
    alert('Please select both start and end dates.');
    return;
  }

  try {
    // Display a loading message in the gallery
    gallery.innerHTML = '<p>🔄 Loading space photos…</p>';

    // Build the API URL with query parameters
    const url = `${apiUrl}?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

    // Fetch data from the API
    const response = await fetch(url);
    const data = await response.json();

    // Clear the gallery
    gallery.innerHTML = '';

    // Check if data is available
    if (data.length === 0) {
      gallery.innerHTML = '<p>No images found for the selected date range.</p>';
      return;
    }

    // Check for API errors
    if (data.code) {
      gallery.innerHTML = `<p>Error: ${data.msg || data.error || 'Unknown error.'}</p>`;
      return;
    }

    // Ensure data is treated as an array
    const results = Array.isArray(data) ? data : [data];

    // Loop through the results and create gallery items
    results.forEach(item => {
      // Create a new div for each gallery item
      const galleryItem = document.createElement('div');
      galleryItem.className = 'gallery-item';

      // Add image or video link, title, and date to the gallery item
      galleryItem.innerHTML = `
        ${item.media_type === 'image'
          ? `<img src="${item.url}" alt="${item.title}" />`
          : `<a href="${item.url}" target="_blank">Watch Video</a>`}
        <p><strong>${item.title}</strong></p>
        <p>${item.date}</p>
      `;

      // Append the gallery item to the gallery
      gallery.appendChild(galleryItem);
    });
  } catch (error) {
    console.error('Error fetching APOD data:', error);
    gallery.innerHTML = '<p>Failed to load images. Please try again later.</p>';
  }
};

// Add event listener to the button
button.addEventListener('click', fetchImages);
