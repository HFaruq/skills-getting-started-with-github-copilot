document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      // Reset activity select (keep placeholder)
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Basic info
        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Participants section (rendered as DOM to avoid HTML injection)
        const participantsSection = document.createElement('div');
        participantsSection.className = 'participants-section';

        const participantsHeading = document.createElement('h5');
        participantsHeading.textContent = 'Participants';
        participantsSection.appendChild(participantsHeading);

        const participantsArea = document.createElement('div');
        participantsArea.className = 'participants-area';

        if (Array.isArray(details.participants) && details.participants.length > 0) {
          const ul = document.createElement('ul');
          ul.className = 'participants-list';

          details.participants.forEach((p) => {
            const li = document.createElement('li');

            // Avatar with initials
            const avatar = document.createElement('span');
            avatar.className = 'participant-avatar';
            // Derive initials from the part before '@' or from words
            const base = String(p || '').split('@')[0];
            const parts = base.split(/[\s._-]+/).filter(Boolean);
            let initials = '';
            if (parts.length === 0) {
              initials = '?';
            } else if (parts.length === 1) {
              initials = parts[0].slice(0, 2).toUpperCase();
            } else {
              initials = (parts[0][0] + parts[1][0]).toUpperCase();
            }
            avatar.textContent = initials;

            // Email / display text
            const span = document.createElement('span');
            span.className = 'participant-email';
            span.textContent = p;

            li.appendChild(avatar);
            li.appendChild(span);
            ul.appendChild(li);
          });

          participantsArea.appendChild(ul);
        } else {
          const none = document.createElement('p');
          none.className = 'no-participants';
          none.textContent = 'No participants yet — be the first to join!';
          participantsArea.appendChild(none);
        }

        participantsSection.appendChild(participantsArea);
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities list so participants and availability update
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
