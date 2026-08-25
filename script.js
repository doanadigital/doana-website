document.getElementById("year") &&
  (document.getElementById("year").textContent =
    new Date().getFullYear());


// =========================
// MOBILE NAVIGATION
// =========================

const menuBtn = document.querySelector(".menu-btn");
const links = document.querySelector(".nav-links");

if (menuBtn && links) {
  menuBtn.addEventListener("click", () => {
    links.classList.toggle("open");
  });
}


// =========================
// ACTIVE NAVIGATION LINK
// =========================

const current =
  location.pathname.split("/").pop() || "index.html";

document.querySelectorAll(".nav-links a").forEach((a) => {
  const href = a.getAttribute("href");

  if (href === current) {
    a.classList.add("active");
  }
});


// =========================
// CONTACT FORM - WEB3FORMS
// =========================

const contactForm =
  document.getElementById("contactForm");

const contactSubmit =
  document.getElementById("contactSubmit");

const contactSuccess =
  document.getElementById("success");


if (contactForm) {

  contactForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      // Reset message
      if (contactSuccess) {
        contactSuccess.style.display = "none";
        contactSuccess.textContent = "";
      }


      // Disable button while sending
      if (contactSubmit) {
        contactSubmit.disabled = true;
        contactSubmit.textContent = "Sending...";
      }


      const formData =
        new FormData(contactForm);


      const formObject =
        Object.fromEntries(
          formData.entries()
        );


      try {

        const response =
          await fetch(
            "https://api.web3forms.com/submit",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                "Accept":
                  "application/json"
              },

              body:
                JSON.stringify(
                  formObject
                )
            }
          );


        const result =
          await response.json();


        if (
          response.ok &&
          result.success
        ) {

          contactForm.reset();


          if (contactSuccess) {

            contactSuccess.style.display =
              "block";

            contactSuccess.textContent =
              "Thank you! Your inquiry has been sent successfully. We'll get back to you shortly.";

          }

        } else {

          throw new Error(
            result.message ||
            "Unable to send your message."
          );

        }

      } catch (error) {

        console.error(
          "Web3Forms submission error:",
          error
        );


        if (contactSuccess) {

          contactSuccess.style.display =
            "block";

          contactSuccess.textContent =
            "Sorry, your inquiry could not be sent. Please try again in a moment.";

        }

      } finally {

        if (contactSubmit) {

          contactSubmit.disabled =
            false;

          contactSubmit.textContent =
            "Send Inquiry";

        }

      }

    }
  );

}


// =========================
// REVIEWS
// =========================

const starterReviews = [
  {
    name:
      "jaredb85 Longwood, United States",

    business:
      "Minimalist Face Graphic for PowerPoint",

    rating: 5,

    text:
      "Did a nice job designing an a graphic image for my power point presentation."
  },

  {
    name:
      "Carol M. Erskine, Ireland",

    business:
      "Colorful Product Promo Poster",

    rating: 5,

    text:
      "Fabulous exchange.... worked well and to my specifications. Quick response. thanks"
  }
];


function getReviews() {

  try {

    const stored =
      JSON.parse(
        localStorage.getItem(
          "doanaReviews"
        ) || "[]"
      );


    return [
      ...stored,
      ...starterReviews
    ];

  } catch {

    return starterReviews;

  }

}


function escapeHtml(str) {

  return String(str).replace(
    /[&<>"']/g,

    (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[m]
  );

}


function renderReviews(
  targetId,
  max = null
) {

  const el =
    document.getElementById(
      targetId
    );


  if (!el) return;


  const reviews =
    getReviews();


  const display =
    max
      ? reviews.slice(0, max)
      : reviews;


  el.innerHTML =
    display
      .map(
        (r) => `
          <article class="review">

            <div class="stars">
              ${"★".repeat(
                Number(r.rating)
              )}
            </div>

            <p>
              “${escapeHtml(
                r.text
              )}”
            </p>

            <div class="client">
              ${escapeHtml(
                r.name
              )}
            </div>

            <div class="meta">
              ${escapeHtml(
                r.business ||
                "Client"
              )}
            </div>

          </article>
        `
      )
      .join("");

}


renderReviews(
  "reviewList"
);

renderReviews(
  "homeReviews",
  3
);


// =========================
// FEEDBACK FORM
// =========================

const feedbackForm =
  document.getElementById(
    "feedbackForm"
  );


if (feedbackForm) {

  feedbackForm.addEventListener(
    "submit",
    (e) => {

      e.preventDefault();


      const data =
        new FormData(
          feedbackForm
        );


      const review = {

        name:
          data.get(
            "clientName"
          ),

        business:
          data.get(
            "clientBusiness"
          ),

        rating:
          data.get(
            "rating"
          ),

        text:
          data.get(
            "feedbackText"
          ),

        createdAt:
          new Date()
            .toISOString()

      };


      const existing =
        JSON.parse(
          localStorage.getItem(
            "doanaReviews"
          ) || "[]"
        );


      existing.unshift(
        review
      );


      localStorage.setItem(
        "doanaReviews",
        JSON.stringify(
          existing
        )
      );


      feedbackForm.reset();


      const success =
        document.getElementById(
          "feedbackSuccess"
        );


      if (success) {

        success.style.display =
          "block";

      }


      renderReviews(
        "reviewList"
      );


      renderReviews(
        "homeReviews",
        3
      );

    }
  );

}


// =========================
// HERO IMAGE SLIDER
// =========================

const heroSlides =
  document.querySelectorAll(
    ".hero-slide"
  );


let currentHeroSlide = 0;

let heroInterval;


// Only run if hero slides exist
if (heroSlides.length > 0) {


  // Make sure first image starts visible
  heroSlides.forEach(
    (slide, index) => {

      slide.classList.remove(
        "active"
      );


      if (index === 0) {

        slide.classList.add(
          "active"
        );

      }

    }
  );


  function showHeroSlide(
    index
  ) {

    heroSlides[
      currentHeroSlide
    ].classList.remove(
      "active"
    );


    currentHeroSlide =
      index;


    heroSlides[
      currentHeroSlide
    ].classList.add(
      "active"
    );

  }


  function nextHeroSlide() {

    const next =
      (
        currentHeroSlide + 1
      ) %
      heroSlides.length;


    showHeroSlide(
      next
    );

  }


  function startHeroSlider() {

    clearInterval(
      heroInterval
    );


    heroInterval =
      setInterval(
        nextHeroSlide,
        4000
      );

  }


  // Start automatic slideshow
  startHeroSlider();

}