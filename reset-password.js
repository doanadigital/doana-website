// ========================================
// SUPABASE CONFIG
// ========================================

const SUPABASE_URL =
  "YOUR_SUPABASE_PROJECT_URL";

const SUPABASE_ANON_KEY =
  "YOUR_SUPABASE_ANON_KEY";


// ========================================
// ELEMENTS
// ========================================

const resetForm =
  document.getElementById(
    "resetPasswordForm"
  );


const resetButton =
  document.getElementById(
    "resetPasswordButton"
  );


const resetStatus =
  document.getElementById(
    "passwordResetStatus"
  );


// ========================================
// GET RECOVERY TOKEN
// ========================================

// Supabase recovery links may provide
// tokens in the URL hash.

const hashParams =
  new URLSearchParams(
    window.location.hash.substring(1)
  );


let accessToken =
  hashParams.get(
    "access_token"
  );


const refreshToken =
  hashParams.get(
    "refresh_token"
  );


// ========================================
// RESET PASSWORD
// ========================================

if (resetForm) {

  resetForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const password =
        document
          .getElementById(
            "newPassword"
          )
          .value;


      const confirmPassword =
        document
          .getElementById(
            "confirmPassword"
          )
          .value;


      if (
        password !==
        confirmPassword
      ) {

        resetStatus.style.display =
          "block";


        resetStatus.textContent =
          "Passwords do not match.";


        return;

      }


      if (
        password.length < 10
      ) {

        resetStatus.style.display =
          "block";


        resetStatus.textContent =
          "Use a password with at least 10 characters.";


        return;

      }


      if (!accessToken) {

        resetStatus.style.display =
          "block";


        resetStatus.textContent =
          "This password reset link is invalid or has expired. Please request a new one.";


        return;

      }


      resetButton.disabled =
        true;


      resetButton.textContent =
        "Updating...";


      try {

        const response =
          await fetch(
            `${SUPABASE_URL}/auth/v1/user`,
            {

              method:
                "PUT",

              headers: {

                "apikey":
                  SUPABASE_ANON_KEY,

                "Authorization":
                  `Bearer ${accessToken}`,

                "Content-Type":
                  "application/json"

              },

              body:
                JSON.stringify({

                  password

                })

            }
          );


        if (!response.ok) {

          const error =
            await response.json();


          throw new Error(
            error.message ||
            "Unable to update password."
          );

        }


        resetStatus.style.display =
          "block";


        resetStatus.textContent =
          "Password updated successfully. Redirecting to admin login...";


        setTimeout(
          () => {

            window.location.href =
              "admin.html";

          },
          2000
        );


      } catch (error) {

        console.error(
          "Password update error:",
          error
        );


        resetStatus.style.display =
          "block";


        resetStatus.textContent =
          "Unable to update your password. The reset link may have expired.";

      } finally {

        resetButton.disabled =
          false;


        resetButton.textContent =
          "Update Password";

      }

    }
  );

}