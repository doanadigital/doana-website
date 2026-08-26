(() => {


// =====================================================
// DOANA DIGITAL
// PUBLIC WEBSITE JAVASCRIPT
// =====================================================


// =====================================================
// SUPABASE
// =====================================================

const PUBLIC_SUPABASE_URL =
  "https://efbmmxtteekbjayiesft.supabase.co";


const PUBLIC_SUPABASE_KEY =
  "sb_publishable_xBSJ2JvLfmitO7-e-JJHpw_Ak3R7joj";



// =====================================================
// YEAR
// =====================================================

const yearElement =
  document.getElementById(
    "year"
  );


if (yearElement) {

  yearElement.textContent =
    new Date().getFullYear();

}



// =====================================================
// MOBILE NAVIGATION
// =====================================================

const menuButton =
  document.querySelector(
    ".menu-btn"
  );


const navigationLinks =
  document.querySelector(
    ".nav-links"
  );


if (
  menuButton &&
  navigationLinks
) {

  menuButton.addEventListener(
    "click",
    () => {

      navigationLinks.classList.toggle(
        "open"
      );

    }
  );


  navigationLinks
    .querySelectorAll("a")
    .forEach(
      link => {

        link.addEventListener(
          "click",
          () => {

            navigationLinks.classList.remove(
              "open"
            );

          }
        );

      }
    );

}



// =====================================================
// ACTIVE NAVIGATION LINK
// =====================================================

const currentPage =
  window.location.pathname
    .split("/")
    .pop() ||
  "index.html";


document
  .querySelectorAll(
    ".nav-links a"
  )
  .forEach(
    link => {

      const href =
        link.getAttribute(
          "href"
        );


      if (
        href ===
        currentPage
      ) {

        link.classList.add(
          "active"
        );

      }

    }
  );



// =====================================================
// HTML ESCAPING
// =====================================================

function escapeHtml(
  value
) {

  return String(
    value ?? ""
  ).replace(

    /[&<>"']/g,

    character => ({

      "&":
        "&amp;",

      "<":
        "&lt;",

      ">":
        "&gt;",

      '"':
        "&quot;",

      "'":
        "&#039;"

    })[character]

  );

}



// =====================================================
// STARTER REVIEWS
// =====================================================
//
// These remain visible even if Supabase temporarily
// cannot be reached.
//
// Approved Supabase reviews are shown BEFORE these.
// =====================================================

const starterReviews = [

  {

    name:
      "jaredb85 — Longwood, United States",

    business:
      "Minimalist Face Graphic for PowerPoint",

    rating:
      5,

    text:
      "Did a nice job designing an a graphic image for my power point presentation."

  },


  {

    name:
      "Carol M. — Erskine, Ireland",

    business:
      "Colorful Product Promo Poster",

    rating:
      5,

    text:
      "Fabulous exchange.... worked well and to my specifications. Quick response. thanks"

  }

];



// =====================================================
// FETCH APPROVED REVIEWS FROM SUPABASE
// =====================================================

async function getApprovedReviews() {

  try {

    const endpoint =

      `${PUBLIC_SUPABASE_URL}` +
      `/rest/v1/reviews` +
      `?select=id,name,business,rating,text,created_at` +
      `&status=eq.approved` +
      `&order=created_at.desc`;


    const response =
      await fetch(

        endpoint,

        {

          method:
            "GET",

          headers: {

            apikey:
              PUBLIC_SUPABASE_KEY,

            Authorization:
              `Bearer ${PUBLIC_SUPABASE_KEY}`

          }

        }

      );


    if (!response.ok) {

      const errorText =
        await response.text();


      throw new Error(
        errorText
      );

    }


    const reviews =
      await response.json();


    if (
      !Array.isArray(
        reviews
      )
    ) {

      return [];

    }


    return reviews;


  } catch (error) {

    console.error(
      "Unable to load approved reviews:",
      error
    );


    return [];

  }

}



// =====================================================
// REVIEW STARS
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
// REVIEW HTML
// =====================================================

function createReviewHtml(
  review
) {

  return `

    <article class="review">

      <div
        class="stars"
        aria-label="${escapeHtml(
          review.rating
        )} out of 5 stars"
      >
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
          review.name ||
          "Client"
        )}

      </div>


      <div class="meta">

        ${escapeHtml(
          review.business ||
          "Doana Digital Client"
        )}

      </div>

    </article>

  `;

}



// =====================================================
// RENDER PUBLIC REVIEWS
// =====================================================

async function renderPublicReviews(
  targetId,
  maximum = null
) {

  const container =
    document.getElementById(
      targetId
    );


  if (!container) {
    return;
  }


  container.innerHTML = `

    <p class="note">
      Loading reviews...
    </p>

  `;


  const approvedReviews =
    await getApprovedReviews();


  // Supabase reviews are first.
  // Starter reviews remain afterwards.

  const allReviews = [

    ...approvedReviews,

    ...starterReviews

  ];


  const displayedReviews =
    maximum

      ? allReviews.slice(
          0,
          maximum
        )

      : allReviews;


  if (
    displayedReviews.length ===
    0
  ) {

    container.innerHTML = `

      <p class="note">
        No reviews have been published yet.
      </p>

    `;

    return;

  }


  container.innerHTML =
    displayedReviews
      .map(
        createReviewHtml
      )
      .join("");

}



// =====================================================
// LOAD REVIEWS
// =====================================================
//
// feedback.html uses reviewList
// index.html uses homeReviews
// =====================================================

renderPublicReviews(
  "reviewList"
);


renderPublicReviews(
  "homeReviews",
  3
);



// =====================================================
// FEEDBACK FORM
// =====================================================

const feedbackForm =
  document.getElementById(
    "feedbackForm"
  );


if (feedbackForm) {

  feedbackForm.addEventListener(

    "submit",

    async event => {

      event.preventDefault();


      const formData =
        new FormData(
          feedbackForm
        );


      const name =
        String(
          formData.get(
            "clientName"
          ) || ""
        ).trim();


      const business =
        String(
          formData.get(
            "clientBusiness"
          ) || ""
        ).trim();


      const rating =
        Number(
          formData.get(
            "rating"
          )
        );


      const text =
        String(
          formData.get(
            "feedbackText"
          ) || ""
        ).trim();



      // =============================================
      // VALIDATION
      // =============================================

      if (
        !name ||
        !text ||
        rating < 1 ||
        rating > 5
      ) {

        showFeedbackMessage(
          "Please complete all required fields."
        );

        return;

      }



      const review = {

        name,

        business:
          business ||
          null,

        rating,

        text,

        status:
          "pending"

      };



      const submitButton =
        feedbackForm.querySelector(
          'button[type="submit"]'
        );


      if (submitButton) {

        submitButton.disabled =
          true;

        submitButton.textContent =
          "Submitting...";

      }



      hideFeedbackMessage();


      try {

        const response =
          await fetch(

            `${PUBLIC_SUPABASE_URL}/rest/v1/reviews`,

            {

              method:
                "POST",

              headers: {

                apikey:
                  PUBLIC_SUPABASE_KEY,

                Authorization:
                  `Bearer ${PUBLIC_SUPABASE_KEY}`,

                "Content-Type":
                  "application/json",

                Prefer:
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
            errorText
          );

        }



        feedbackForm.reset();



        showFeedbackMessage(

          "Thank you! Your feedback has been submitted and will appear after it is approved."

        );


      } catch (error) {

        console.error(
          "Feedback submission error:",
          error
        );


        showFeedbackMessage(

          "We couldn't submit your feedback right now. Please try again."

        );

      } finally {

        if (submitButton) {

          submitButton.disabled =
            false;

          submitButton.textContent =
            "Submit feedback";

        }

      }

    }

  );

}



// =====================================================
// FEEDBACK MESSAGE HELPERS
// =====================================================

function showFeedbackMessage(
  message
) {

  const element =
    document.getElementById(
      "feedbackSuccess"
    );


  if (!element) {
    return;
  }


  element.textContent =
    message;


  element.style.display =
    "block";

}


function hideFeedbackMessage() {

  const element =
    document.getElementById(
      "feedbackSuccess"
    );


  if (!element) {
    return;
  }


  element.textContent =
    "";


  element.style.display =
    "none";

}



// =====================================================
// CONTACT FORM
// =====================================================
//
// Compatible with your contact_inquiries table.
//
// Expected possible field names:
// name
// email
// phone
// business
// service
// budget
// timeline
// message
//
// Missing optional fields become null.
// =====================================================

const contactForm =
  document.getElementById(
    "contactForm"
  );


if (contactForm) {

  contactForm.addEventListener(

    "submit",

    async event => {

      event.preventDefault();


      const formData =
        new FormData(
          contactForm
        );


      const getValue =
        field => {

          const value =
            formData.get(
              field
            );


          if (
            value === null ||
            value === undefined
          ) {

            return null;

          }


          const cleaned =
            String(value).trim();


          return cleaned ||
            null;

        };



      const inquiry = {

        name:
          getValue("name"),

        email:
          getValue("email"),

        phone:
          getValue("phone"),

        business:
          getValue("business"),

        service:
          getValue("service"),

        budget:
          getValue("budget"),

        timeline:
          getValue("timeline"),

        message:
          getValue("message"),

        status:
          "new"

      };



      if (
        !inquiry.name ||
        !inquiry.email ||
        !inquiry.message
      ) {

        showContactMessage(

          "Please complete the required fields."

        );

        return;

      }



      const submitButton =
        contactForm.querySelector(
          'button[type="submit"]'
        );


      if (submitButton) {

        submitButton.disabled =
          true;

        submitButton.textContent =
          "Sending...";

      }


      hideContactMessage();


      try {

        const response =
          await fetch(

            `${PUBLIC_SUPABASE_URL}/rest/v1/contact_inquiries`,

            {

              method:
                "POST",

              headers: {

                apikey:
                  PUBLIC_SUPABASE_KEY,

                Authorization:
                  `Bearer ${PUBLIC_SUPABASE_KEY}`,

                "Content-Type":
                  "application/json",

                Prefer:
                  "return=minimal"

              },

              body:
                JSON.stringify(
                  inquiry
                )

            }

          );


        if (!response.ok) {

          const errorText =
            await response.text();


          throw new Error(
            errorText
          );

        }



        contactForm.reset();



        showContactMessage(

          "Thank you! Your project inquiry has been sent. We'll get back to you soon."

        );


      } catch (error) {

        console.error(
          "Contact form error:",
          error
        );


        showContactMessage(

          "We couldn't send your inquiry right now. Please try again."

        );

      } finally {

        if (submitButton) {

          submitButton.disabled =
            false;

          submitButton.textContent =
            "Send inquiry";

        }

      }

    }

  );

}



// =====================================================
// CONTACT MESSAGE HELPERS
// =====================================================

function showContactMessage(
  message
) {

  const element =
    document.getElementById(
      "success"
    );


  if (!element) {
    return;
  }


  element.textContent =
    message;


  element.style.display =
    "block";

}


function hideContactMessage() {

  const element =
    document.getElementById(
      "success"
    );


  if (!element) {
    return;
  }


  element.textContent =
    "";


  element.style.display =
    "none";

}



// =====================================================
// HERO IMAGE SLIDER
// =====================================================

const heroSlides =
  document.querySelectorAll(
    ".hero-slide"
  );


let currentHeroSlide =
  0;


let heroInterval =
  null;



if (
  heroSlides.length >
  0
) {


  heroSlides.forEach(
    (
      slide,
      index
    ) => {

      slide.classList.remove(
        "active"
      );


      if (
        index ===
        0
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
    ]?.classList.remove(
      "active"
    );


    currentHeroSlide =
      index;


    heroSlides[
      currentHeroSlide
    ]?.classList.add(
      "active"
    );

  }



  function nextHeroSlide() {

    const next =

      (
        currentHeroSlide +
        1
      ) %

      heroSlides.length;


    showHeroSlide(
      next
    );

  }



  function startHeroSlider() {

    if (heroInterval) {

      clearInterval(
        heroInterval
      );

    }


    heroInterval =
      setInterval(
        nextHeroSlide,
        4000
      );

  }



  startHeroSlider();

}


})();