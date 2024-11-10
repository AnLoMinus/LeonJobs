document.addEventListener("DOMContentLoaded", () => {
  const noticeBoard = document.getElementById("notice-board");
  const jobModal = document.getElementById("job-modal");
  const modalClose = document.getElementById("modal-close");
  const modalTitle = document.getElementById("modal-title");
  const modalDescription = document.getElementById("modal-description");
  const modalLocation = document.getElementById("modal-location");
  const modalRequirements = document.getElementById("modal-requirements");
  const modalDate = document.getElementById("modal-date");
  const modalDetails = document.getElementById("modal-details");

  // Fetch jobs from JSON file
  async function fetchJobs() {
    const cachedJobs = localStorage.getItem("jobsCache");
    const cacheTimestamp = localStorage.getItem("jobsCacheTimestamp");

    // בדיקה אם יש cache תקף (פחות מ-5 דקות)
    if (cachedJobs && cacheTimestamp && Date.now() - cacheTimestamp < 300000) {
      return JSON.parse(cachedJobs);
    }

    const response = await fetch("jobs.json");
    const jobs = await response.json();

    localStorage.setItem("jobsCache", JSON.stringify(jobs));
    localStorage.setItem("jobsCacheTimestamp", Date.now());

    return jobs;
  }

  fetchJobs()
    .then((jobs) => {
      noticeBoard.innerHTML = "";
      jobs.forEach((job) => {
        const notice = document.createElement("div");
        notice.classList.add("notice", "accessible");
        notice.innerHTML = `
                    <h3 style="text-align:center;">${job.title}</h3>
                    <p><strong>תאריך פרסום:</strong> ${job.date}</p>
                    <p>${job.description}</p>
                    <div class="details">
                        <p><strong>מיקום:</strong> ${job.location}</p>
                        <p><strong>דרישות:</strong> ${job.requirements}</p>
                    </div>
                    <div class="share-options">
                        <button class="share-btn">📤 שתף</button>
                        <div class="share-dropdown">
                            <a href="#" class="share-option whatsapp">
                                <img src="whatsapp-icon.png" alt="WhatsApp">
                                WhatsApp
                            </a>
                            <a href="#" class="share-option telegram">
                                <img src="telegram-icon.png" alt="Telegram">
                                Telegram
                            </a>
                            <a href="#" class="share-option email">
                                <img src="email-icon.png" alt="Email">
                                אימייל
                            </a>
                            <button class="share-option copy-link">
                                <img src="link-icon.png" alt="Copy">
                                העתק קישור
                            </button>
                        </div>
                    </div>
                    <a href="#" class="view-details" data-title="${job.title}" data-description="${job.description}" data-location="${job.location}" data-requirements="${job.requirements}" data-date="${job.date}" data-details="${job.details}">צפה בפרטים</a>
                `;
        noticeBoard.appendChild(notice);
      });

      // Add event listeners for modal
      document.querySelectorAll(".view-details").forEach((button) => {
        button.addEventListener("click", (e) => {
          e.preventDefault();
          const { title, description, location, requirements, date, details } =
            e.target.dataset;
          modalTitle.textContent = sanitizeHTML(title);
          modalDescription.textContent = description;
          modalLocation.textContent = location;
          modalRequirements.textContent = requirements;
          modalDate.textContent = date;
          modalDetails.textContent = details;
          jobModal.style.display = "flex";
        });
      });
    })
    .catch((error) => console.error("Error loading jobs:", error));

  // Close modal
  modalClose.addEventListener("click", () => {
    jobModal.style.display = "none";
  });

  // Close modal when clicking outside of the content
  window.addEventListener("click", (e) => {
    if (e.target === jobModal) {
      jobModal.style.display = "none";
    }
  });

  // Add search functionality
  const searchInput = document.getElementById("searchInput");

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const debouncedFilterJobs = debounce(filterJobs, 300);
  searchInput.addEventListener("input", debouncedFilterJobs);

  function filterJobs() {
    const searchTerm = searchInput.value.toLowerCase();
    const locationFilter = document.getElementById("locationFilter").value;

    document.querySelectorAll(".notice").forEach((notice) => {
      const title = notice.querySelector("h3").textContent.toLowerCase();
      const location = notice
        .querySelector(".details p")
        .textContent.toLowerCase();

      const matchesSearch =
        title.includes(searchTerm) || location.includes(searchTerm);
      const matchesLocation =
        !locationFilter || location.includes(locationFilter.toLowerCase());

      notice.style.display =
        matchesSearch && matchesLocation ? "block" : "none";
    });
  }

  // Add keyboard navigation for modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && jobModal.style.display === "flex") {
      jobModal.style.display = "none";
    }
  });

  // Add this to your existing DOMContentLoaded event listener
  function updateDateTime() {
    const now = new Date();

    // Update clock
    const timeString = now.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    document.getElementById("clock").textContent = timeString;

    // Update date
    const dateString = now.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    document.getElementById("date").textContent = dateString;
  }

  // Update every second
  setInterval(updateDateTime, 1000);
  updateDateTime(); // Initial call

  const backToTop = document.getElementById("backToTop");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }
  });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const darkModeToggle = document.getElementById("darkModeToggle");

  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDarkMode = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDarkMode);
    darkModeToggle.textContent = isDarkMode ? "☀️" : "🌙";
  });

  // WhatsApp integration
  const whatsappBtn = document.getElementById("whatsappInterest");

  whatsappBtn.addEventListener("click", () => {
    const jobTitle = modalTitle.textContent;
    const jobLocation = modalLocation.textContent;
    const jobRequirements = modalRequirements.textContent;

    const message =
      `שלום, אני מעוניין/ת במשרה הבאה:\n\n` +
      `🏢 משרה: ${jobTitle}\n` +
      `📍 מיקום: ${jobLocation}\n` +
      `📋 דרישות: ${jobRequirements}\n\n` +
      `אשמח לקבל פרטים נוספים.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/972543285967?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  });

  // Add this to your existing DOMContentLoaded event listener
  const pillButtons = document.querySelectorAll(".pill-btn");
  pillButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
    });
  });

  const salaryRange = document.querySelector(".salary-range");
  const maxValue = document.querySelector(".max-value");
  salaryRange.addEventListener("input", (e) => {
    maxValue.textContent = `₪${Number(e.target.value).toLocaleString()}`;
  });

  // יש להוסיף פונקציית sanitize
  function sanitizeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ושימוש בה בעת הכנסת תוכן
  modalTitle.textContent = sanitizeHTML(title);

  // טעינת ההעדפות בטעינת הדף
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    darkModeToggle.textContent = "☀️";
  }
});
