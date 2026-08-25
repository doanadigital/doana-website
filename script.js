// =====================================================
// DOANA DIGITAL
// MAIN WEBSITE JAVASCRIPT
// =====================================================



// =====================================================
// SUPABASE
// =====================================================

const SUPABASE_URL =
  "https://efbmmxtteekbjayiesft.supabase.co";


const SUPABASE_ANON_KEY =
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

const menuBtn =
  document.querySelector(
    ".menu-btn"
  );


const navLinks =
  document.querySelector(
    ".nav-links"
  );


if (
  menuBtn &&
  navLinks
) {

  menuBtn.addEventListener(
    "click",
    () => {

      navLinks.classList.toggle(
        "open"
      );

    }
  );

}



// =====================================================
// ACTIVE NAVIGATION
// =====================================================

const currentPage =
  location.pathname
    .split("/")
    .pop() ||
  "index.html";


document
  .querySelectorAll(
    ".nav-links a"
  )
  .forEach(

    link => {

      if (
        link.getAttribute(
          "href"
        ) ===
        currentPage
      ) {

        link.classList.add(
          "active"
        );

      }

    }

  );



// =====================================================
// CONTACT FORM
// WEB3FORMS + SUPABASE
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
    async event => {

      event.preventDefault();


      if (contactSuccess) {

        contactSuccess.style.display =
          "none";


        contactSuccess.textContent =
          "";

      }


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


      const inquiry = {

        name:
          String(
            formData.get(
              "name"
            ) || ""
          ).trim(),

        email:
          String(
            formData.get(
              "email"
            ) || ""
          ).trim(),

        phone:
          String(
            formData.get(
              "phone"
            ) || ""
          ).trim() || null,

        business:
          String(
            formData.get(
              "business"
            ) || ""
          ).trim() || null,

        service:
          String(
            formData.get(
              "service"
            ) || ""
          ).trim(),

        budget:
          String(
            formData.get(
              "budget"
            ) || ""
          ).trim() || null,

        timeline:
          String(
            formData.get(
              "timeline"
            ) || ""
          ).trim() || null,

        message:
          String(
            formData.get(
              "message"
            ) || ""
          ).trim(),

        status:
          "new"

      };


      try {

        // -----------------------------------------
        // SEND EMAIL
        // -----------------------------------------

        const emailResponse =
          await fetch(

            "https://api.web3forms.com/submit",

            {

              method:
                "POST",

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


        const emailResult =
          await emailResponse.json();


        if (
          !emailResponse.ok ||
          !emailResult.success
        ) {

          throw new Error(
            emailResult.message ||
            "Unable to send inquiry."
          );

        }



        // -----------------------------------------
        // SAVE TO SUPABASE
        // -----------------------------------------

        const databaseResponse =
          await fetch(

            `${SUPABASE_URL}/rest/v1/contact_inquiries`,

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
                  inquiry
                )

            }

          );


        if (!databaseResponse.ok) {

          console.error(
            "Inquiry database error:",
            await databaseResponse.text()
          );

        }


        contactForm.reset();


        if (contactSuccess) {

          contactSuccess.style.display =
            "block";


          contactSuccess.textContent =
            "Thank you! Your inquiry has been sent successfully. We'll get back to you shortly.";

        }


      } catch (error) {

        console.error(
          "Contact submission error:",
          error
        );


        if (contactSuccess) {

          contactSuccess.style.display =
            "block";


          contactSuccess.textContent =
            "Sorry, your inquiry could not be sent. Please try again.";

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
// EXISTING TESTIMONIALS
// =====================================================

const starterReviews = [

  {

    name:
      "jaredb85 Longwood, United States",

    business:
      "Minimalist Face Graphic for PowerPoint",

    rating:
      5,

    text:
      "Did a nice job designing an a graphic image for my power point presentation."

  },


  {

    name:
      "Carol M. Erskine, Ireland",

    business:
      "Colorful Product Promo Poster",

    rating:
      5,

    text:
      "Fabulous exchange.... worked well and to my specifications. Quick response. thanks"

  }

];



let approvedOnlineReviews =
  [];



// =====================================================
// ESCAPE HTML
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
// STARS
// =====================================================

function createStars(
  rating
) {

  const safeRating =
    Math.max(

      1,

      Math.min(

        5,

        Number(
          rating
        ) || 5

      )

    );


  return "★".repeat(
    safeRating
  );

}



// =====================================================
// PUBLIC REVIEWS
// =====================================================

function getPublicReviews() {

  return [

    ...approvedOnlineReviews,

    ...starterReviews

  ];

}



// =====================================================
// RENDER PUBLIC REVIEWS
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


  element.innerHTML =

    display

      .map(

        review => `

          <article
            class="review"
          >

            <div
              class="stars"
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


            <div
              class="client"
            >
              ${escapeHtml(
                review.name
              )}
            </div>


            <div
              class="meta"
            >
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
// LOAD APPROVED REVIEWS
// =====================================================

async function loadApprovedReviews() {

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

          headers: {

            "apikey":
              SUPABASE_ANON_KEY,

            "Authorization":
              `Bearer ${SUPABASE_ANON_KEY}`

          }

        }

      );


    if (!response.ok) {

      throw new Error(
        await response.text()
      );

    }


    approvedOnlineReviews =
      await response.json();


  } catch (error) {

    console.error(
      "Review loading error:",
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
    async event => {

      event.preventDefault();


      if (feedbackSubmit) {

        feedbackSubmit.disabled =
          true;


        feedbackSubmit.textContent =
          "Submitting...";

      }


      if (feedbackSuccess) {

        feedbackSuccess.style.display =
          "none";


        feedbackSuccess.textContent =
          "";

      }


      const data =
        new FormData(
          feedbackForm
        );


      const review = {

        name:
          String(
            data.get(
              "clientName"
            ) || ""
          ).trim(),

        business:
          String(
            data.get(
              "clientBusiness"
            ) || ""
          ).trim() || null,

        rating:
          Number(
            data.get(
              "rating"
            )
          ),

        text:
          String(
            data.get(
              "feedbackText"
            ) || ""
          ).trim(),

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

          throw new Error(
            await response.text()
          );

        }


        feedbackForm.reset();


        if (feedbackSuccess) {

          feedbackSuccess.style.display =
            "block";


          feedbackSuccess.textContent =
            "Thank you! Your feedback has been submitted and will appear after review.";

        }


      } catch (error) {

        console.error(
          "Feedback error:",
          error
        );


        if (feedbackSuccess) {

          feedbackSuccess.style.display =
            "block";


          feedbackSuccess.textContent =
            "Sorry, your feedback could not be submitted.";

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
// INITIAL REVIEWS
// =====================================================

renderReviews(
  "reviewList"
);


renderReviews(
  "homeReviews",
  3
);


loadApprovedReviews();



// =====================================================
// HERO SLIDER
// =====================================================

const heroSlides =
  document.querySelectorAll(
    ".hero-slide"
  );


let currentHeroSlide =
  0;


let heroInterval;



if (
  heroSlides.length >
  0
) {


  heroSlides.forEach(

    (slide, index) => {

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
        currentHeroSlide +
        1
      ) %

      heroSlides.length;


    showHeroSlide(
      next
    );

  }



  heroInterval =
    setInterval(
      nextHeroSlide,
      4000
    );

}