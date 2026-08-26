(() => {

  "use strict";


  // =====================================================
  // DOANA DIGITAL
  // PUBLIC WEBSITE JAVASCRIPT
  //
  // Handles:
  // - Footer year
  // - Mobile navigation
  // - Active navigation
  // - Approved public reviews
  // - Starter reviews
  // - Contact service prefill
  // - Hero slider
  //
  // IMPORTANT:
  // Contact + Feedback submission is handled separately
  // by secure-forms.js through:
  //
  // Cloudflare Turnstile
  //        ↓
  // Supabase Edge Function
  //        ↓
  // Database
  // =====================================================



  // =====================================================
  // SUPABASE PUBLIC CONFIG
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
      new Date()
        .getFullYear();

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

        const isOpen =
          navigationLinks
            .classList
            .toggle(
              "open"
            );


        menuButton.setAttribute(
          "aria-expanded",
          String(
            isOpen
          )
        );

      }
    );



    navigationLinks
      .querySelectorAll(
        "a"
      )
      .forEach(
        link => {

          link.addEventListener(
            "click",
            () => {

              navigationLinks
                .classList
                .remove(
                  "open"
                );


              menuButton.setAttribute(
                "aria-expanded",
                "false"
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
      .pop()
      .toLowerCase()
    ||
    "index.html";


  document
    .querySelectorAll(
      ".nav-links a"
    )
    .forEach(
      link => {

        const href =
          String(
            link.getAttribute(
              "href"
            ) || ""
          )
            .split("?")[0]
            .split("#")[0]
            .toLowerCase();


        if (
          href ===
          currentPage
        ) {

          link
            .classList
            .add(
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
  // These are your existing portfolio/client reviews.
  //
  // Approved Supabase reviews are displayed first.
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
  // FETCH APPROVED REVIEWS
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
                `Bearer ${PUBLIC_SUPABASE_KEY}`,

              Accept:
                "application/json"

            }

          }

        );



      if (!response.ok) {

        throw new Error(
          await response.text()
        );

      }



      const reviews =
        await response.json();



      return Array.isArray(
        reviews
      )
        ? reviews
        : [];


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
  // CREATE REVIEW HTML
  // =====================================================

  function createReviewHtml(
    review
  ) {

    const rating =
      Math.max(

        1,

        Math.min(

          5,

          Number(
            review.rating
          ) || 5

        )

      );


    return `

      <article class="review">


        <div
          class="stars"
          aria-label="${rating} out of 5 stars"
        >

          ${createStars(
            rating
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



    const allReviews = [

      ...approvedReviews,

      ...starterReviews

    ];



    const displayedReviews =

      maximum !== null

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
  // LOAD PUBLIC REVIEWS
  // =====================================================
  //
  // feedback.html
  // ↓
  // reviewList
  //
  // index.html
  // ↓
  // homeReviews
  // =====================================================

  renderPublicReviews(
    "reviewList"
  );


  renderPublicReviews(
    "homeReviews",
    3
  );



  // =====================================================
  // CONTACT FORM REFERENCE
  // =====================================================
  //
  // We only use this here for service pre-selection.
  //
  // secure-forms.js handles submission.
  // =====================================================

  const contactForm =
    document.getElementById(
      "contactForm"
    );



  // =====================================================
  // SERVICE QUERY PARAMETER
  // =====================================================
  //
  // Example:
  //
  // services.html
  //       ↓
  //
  // contact.html?service=Business%20Cards
  //
  //       ↓
  //
  // Automatically selects:
  //
  // Business Cards
  // =====================================================

  function prefillContactService() {

    if (!contactForm) {

      return;

    }



    const params =
      new URLSearchParams(
        window.location.search
      );



    const requestedService =
      params.get(
        "service"
      );



    if (!requestedService) {

      return;

    }



    const serviceField =
      contactForm.querySelector(
        '[name="service"]'
      );



    if (!serviceField) {

      return;

    }



    const requestedNormalized =
      requestedService
        .trim()
        .toLowerCase();



    // =================================================
    // SELECT
    // =================================================

    if (
      serviceField.tagName ===
      "SELECT"
    ) {

      const options =
        Array.from(
          serviceField.options
        );



      const matchingOption =
        options.find(
          option => {

            const optionValue =
              String(
                option.value
              )
                .trim()
                .toLowerCase();



            const optionText =
              String(
                option.textContent
              )
                .trim()
                .toLowerCase();



            return (

              optionValue ===
                requestedNormalized

              ||

              optionText ===
                requestedNormalized

            );

          }
        );



      if (matchingOption) {

        serviceField.value =
          matchingOption.value;


        serviceField.dispatchEvent(

          new Event(
            "change",
            {
              bubbles:
                true
            }
          )

        );

      }


      return;

    }



    // =================================================
    // NORMAL INPUT
    // =================================================

    serviceField.value =
      requestedService;

  }



  // =====================================================
  // RUN CONTACT PREFILL
  // =====================================================

  prefillContactService();



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


    // =================================================
    // INITIAL STATE
    // =================================================

    heroSlides.forEach(
      (
        slide,
        index
      ) => {

        slide
          .classList
          .remove(
            "active"
          );


        if (
          index ===
          0
        ) {

          slide
            .classList
            .add(
              "active"
            );

        }

      }
    );



    // =================================================
    // SHOW SLIDE
    // =================================================

    function showHeroSlide(
      index
    ) {

      if (
        !heroSlides.length
      ) {

        return;

      }



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



    // =================================================
    // NEXT SLIDE
    // =================================================

    function nextHeroSlide() {

      const next =

        (
          currentHeroSlide +
          1
        )

        %

        heroSlides.length;



      showHeroSlide(
        next
      );

    }



    // =================================================
    // START SLIDER
    // =================================================

    function startHeroSlider() {

      if (
        heroSlides.length <=
        1
      ) {

        return;

      }



      if (heroInterval) {

        window.clearInterval(
          heroInterval
        );

      }



      heroInterval =
        window.setInterval(

          nextHeroSlide,

          4000

        );

    }



    // =================================================
    // PAUSE WHEN PAGE IS HIDDEN
    // =================================================

    document.addEventListener(
      "visibilitychange",
      () => {

        if (
          document.hidden
        ) {

          if (heroInterval) {

            window.clearInterval(
              heroInterval
            );


            heroInterval =
              null;

          }


          return;

        }



        startHeroSlider();

      }
    );



    startHeroSlider();

  }


})();