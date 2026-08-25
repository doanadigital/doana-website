// =====================================================
// DOANA DIGITAL
// MAIN JAVASCRIPT
// =====================================================



// =====================================================
// YEAR
// =====================================================

const yearElement =
  document.getElementById("year");

if (yearElement) {

  yearElement.textContent =
    new Date().getFullYear();

}



// =====================================================
// MOBILE NAVIGATION
// =====================================================

const menuBtn =
  document.querySelector(".menu-btn");

const links =
  document.querySelector(".nav-links");


if (menuBtn && links) {

  menuBtn.addEventListener(
    "click",
    () => {

      links.classList.toggle(
        "open"
      );

    }
  );

}



// =====================================================
// ACTIVE NAVIGATION LINK
// =====================================================

const current =
  location.pathname
    .split("/")
    .pop() || "index.html";


document
  .querySelectorAll(
    ".nav-links a"
  )
  .forEach(
    (a) => {

      const href =
        a.getAttribute("href");


      if (href === current) {

        a.classList.add(
          "active"
        );

      }

    }
  );



// =====================================================
// CONTACT FORM
// WEB3FORMS
// =====================================================

const contactForm =
  document.getElementById(
    "contactForm"
  );


const contactSubmit =
  document.getElementById(
    "contactSubmit"
  );


const contactSuccess =
  document.getElementById(
    "success"
  );


if (contactForm) {

  contactForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      // Clear previous message

      if (contactSuccess) {

        contactSuccess.style.display =
          "none";

        contactSuccess.textContent =
          "";

      }


      // Disable submit button

      if (contactSubmit) {

        contactSubmit.disabled =
          true;

        contactSubmit.textContent =
          "Sending...";

      }


      const formData =
        new FormData(
          contactForm
        );


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
          "Web3Forms error:",
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



// =====================================================
// SUPABASE CONFIGURATION
// =====================================================


// IMPORTANT:
//
// Replace these TWO values.
//
// Example:
//
// const SUPABASE_URL =
//   "https://abcdefgh.supabase.co";
//
// const SUPABASE_ANON_KEY =
//   "eyJhbGciOi...";


const SUPABASE_URL =
  "https://efbmmxtteekbjayiesft.supabase.co";


const SUPABASE_ANON_KEY =
  "sb_publishable_xBSJ2JvLfmitO7-e-JJHpw_Ak3R7joj";



// =====================================================
// EXISTING DOANA CLIENT REVIEWS
// =====================================================


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



// =====================================================
// REVIEW DATA
// =====================================================


let approvedOnlineReviews = [];



// =====================================================
// ESCAPE HTML
// =====================================================


function escapeHtml(str) {

  return String(
    str ?? ""
  ).replace(

    /[&<>"']/g,

    (character) => ({

      "&": "&amp;",

      "<": "&lt;",

      ">": "&gt;",

      '"': "&quot;",

      "'": "&#039;"

    })[character]

  );

}



// =====================================================
// CREATE STAR RATING
// =====================================================


function createStars(
  rating
) {

  const safeRating =
    Math.max(
      1,
      Math.min(
        5,
        Number(rating) || 5
      )
    );


  return "★".repeat(
    safeRating
  );

}



// =====================================================
// GET ALL PUBLIC REVIEWS
// =====================================================


function getPublicReviews() {

  return [

    ...approvedOnlineReviews,

    ...starterReviews

  ];

}



// =====================================================
// RENDER REVIEWS
// =====================================================


function renderReviews(
  targetId,
  max = null
) {

  const element =
    document.getElementById(
      targetId
    );


  if (!element) {

    return;

  }


  const reviews =
    getPublicReviews();


  const display =
    max
      ? reviews.slice(
          0,
          max
        )
      : reviews;


  if (
    display.length === 0
  ) {

    element.innerHTML = `

      <p class="note">

        No client reviews
        are available yet.

      </p>

    `;


    return;

  }


  element.innerHTML =
    display
      .map(
        (review) => `

          <article class="review">


            <div class="stars">

              ${createStars(
                review.rating
              )}

            </div>


            <p>

              “${escapeHtml(
                review.text
              )}”

            </p>


            <div class="client">

              ${escapeHtml(
                review.name
              )}

            </div>


            <div class="meta">

              ${escapeHtml(
                review.business ||
                "Client"
              )}

            </div>


          </article>

        `
      )
      .join("");

}



// =====================================================
// LOAD APPROVED REVIEWS FROM SUPABASE
// =====================================================


async function loadApprovedReviews() {

  // If Supabase has not been configured,
  // just show starter reviews.

  if (
    SUPABASE_URL.includes(
      "PASTE_"
    ) ||
    SUPABASE_ANON_KEY.includes(
      "PASTE_"
    )
  ) {

    console.warn(
      "Supabase has not been configured yet."
    );


    renderReviews(
      "reviewList"
    );


    renderReviews(
      "homeReviews",
      3
    );


    return;

  }


  try {

    const endpoint =
      `${SUPABASE_URL}/rest/v1/reviews` +
      `?status=eq.approved` +
      `&select=id,name,business,rating,text,created_at` +
      `&order=created_at.desc`;


    const response =
      await fetch(
        endpoint,
        {

          method: "GET",

          headers: {

            "apikey":
              SUPABASE_ANON_KEY,

            "Authorization":
              `Bearer ${SUPABASE_ANON_KEY}`,

            "Accept":
              "application/json"

          }

        }
      );


    if (!response.ok) {

      throw new Error(
        `Supabase returned ${response.status}`
      );

    }


    approvedOnlineReviews =
      await response.json();


  } catch (error) {

    console.error(
      "Unable to load Supabase reviews:",
      error
    );


    approvedOnlineReviews =
      [];

  }


  renderReviews(
    "reviewList"
  );


  renderReviews(
    "homeReviews",
    3
  );

}



// =====================================================
// FEEDBACK FORM
// SUPABASE
// =====================================================


const feedbackForm =
  document.getElementById(
    "feedbackForm"
  );


const feedbackSubmit =
  document.getElementById(
    "feedbackSubmit"
  );


const feedbackSuccess =
  document.getElementById(
    "feedbackSuccess"
  );


if (feedbackForm) {

  feedbackForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      // Supabase configuration check

      if (
        SUPABASE_URL.includes(
          "PASTE_"
        ) ||
        SUPABASE_ANON_KEY.includes(
          "PASTE_"
        )
      ) {

        if (feedbackSuccess) {

          feedbackSuccess.style.display =
            "block";


          feedbackSuccess.textContent =
            "Feedback system is not configured yet.";

        }


        return;

      }


      // Clear old message

      if (feedbackSuccess) {

        feedbackSuccess.style.display =
          "none";

        feedbackSuccess.textContent =
          "";

      }


      // Disable button

      if (feedbackSubmit) {

        feedbackSubmit.disabled =
          true;


        feedbackSubmit.textContent =
          "Submitting...";

      }


      const data =
        new FormData(
          feedbackForm
        );


      const name =
        String(
          data.get(
            "clientName"
          ) || ""
        ).trim();


      const business =
        String(
          data.get(
            "clientBusiness"
          ) || ""
        ).trim();


      const rating =
        Number(
          data.get(
            "rating"
          )
        );


      const text =
        String(
          data.get(
            "feedbackText"
          ) || ""
        ).trim();



      // Basic validation

      if (
        name.length < 2 ||
        text.length < 5 ||
        rating < 1 ||
        rating > 5
      ) {

        if (feedbackSuccess) {

          feedbackSuccess.style.display =
            "block";


          feedbackSuccess.textContent =
            "Please complete all required feedback fields.";

        }


        if (feedbackSubmit) {

          feedbackSubmit.disabled =
            false;


          feedbackSubmit.textContent =
            "Submit Feedback";

        }


        return;

      }



      const review = {

        name:
          name,

        business:
          business || null,

        rating:
          rating,

        text:
          text,

        status:
          "pending"

      };


      try {

        const response =
          await fetch(
            `${SUPABASE_URL}/rest/v1/reviews`,
            {

              method:
                "POST",

              headers: {

                "apikey":
                  SUPABASE_ANON_KEY,

                "Authorization":
                  `Bearer ${SUPABASE_ANON_KEY}`,

                "Content-Type":
                  "application/json",

                "Prefer":
                  "return=minimal"

              },

              body:
                JSON.stringify(
                  review
                )

            }
          );


        if (!response.ok) {

          const errorText =
            await response.text();


          throw new Error(
            errorText ||
            `Supabase returned ${response.status}`
          );

        }


        feedbackForm.reset();


        if (feedbackSuccess) {

          feedbackSuccess.style.display =
            "block";


          feedbackSuccess.textContent =
            "Thank you! Your feedback has been submitted and will appear after it has been reviewed.";

        }


      } catch (error) {

        console.error(
          "Feedback submission error:",
          error
        );


        if (feedbackSuccess) {

          feedbackSuccess.style.display =
            "block";


          feedbackSuccess.textContent =
            "Sorry, your feedback could not be submitted. Please try again.";

        }

      } finally {

        if (feedbackSubmit) {

          feedbackSubmit.disabled =
            false;


          feedbackSubmit.textContent =
            "Submit Feedback";

        }

      }

    }
  );

}



// =====================================================
// INITIAL REVIEW LOAD
// =====================================================


// Show existing testimonials immediately.

renderReviews(
  "reviewList"
);


renderReviews(
  "homeReviews",
  3
);


// Then retrieve approved
// public feedback from Supabase.

loadApprovedReviews();



// =====================================================
// HERO IMAGE SLIDER
// =====================================================


const heroSlides =
  document.querySelectorAll(
    ".hero-slide"
  );


let currentHeroSlide =
  0;


let heroInterval;



if (
  heroSlides.length > 0
) {


  // Set first slide

  heroSlides.forEach(
    (
      slide,
      index
    ) => {

      slide.classList.remove(
        "active"
      );


      if (
        index === 0
      ) {

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



  startHeroSlider();

}