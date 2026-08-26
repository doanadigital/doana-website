// =====================================================
// DOANA DIGITAL
// RESET PASSWORD
// =====================================================

(() => {

  "use strict";


  // =====================================================
  // SUPABASE CONFIG
  // =====================================================

  const SUPABASE_URL =
    "https://efbmmxtteekbjayiesft.supabase.co";


  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_xBSJ2JvLfmitO7-e-JJHpw_Ak3R7joj";



  // =====================================================
  // ELEMENTS
  // =====================================================

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


  const newPasswordInput =
    document.getElementById(
      "newPassword"
    );


  const confirmPasswordInput =
    document.getElementById(
      "confirmPassword"
    );



  // =====================================================
  // STATE
  // =====================================================

  let accessToken =
    null;


  let recoveryReady =
    false;



  // =====================================================
  // STATUS MESSAGE
  // =====================================================

  function showStatus(
    message,
    type = "info"
  ) {

    if (!resetStatus) {
      return;
    }


    resetStatus.textContent =
      message;


    resetStatus.style.display =
      "block";


    resetStatus.dataset.status =
      type;

  }



  function clearStatus() {

    if (!resetStatus) {
      return;
    }


    resetStatus.textContent =
      "";


    resetStatus.style.display =
      "none";


    delete resetStatus.dataset.status;

  }



  // =====================================================
  // GET RECOVERY SESSION FROM URL
  // =====================================================
  //
  // Supabase implicit recovery links typically return:
  //
  // #access_token=...
  // &refresh_token=...
  // &type=recovery
  //
  // =====================================================

  function readRecoverySession() {

    const hash =
      window.location.hash;


    if (!hash) {

      showStatus(
        "This password reset link is invalid or has expired. Please request a new reset link.",
        "error"
      );


      disableForm();

      return;

    }


    const hashParams =
      new URLSearchParams(
        hash.substring(1)
      );


    const token =
      hashParams.get(
        "access_token"
      );


    const type =
      hashParams.get(
        "type"
      );


    const error =
      hashParams.get(
        "error"
      );


    const errorDescription =
      hashParams.get(
        "error_description"
      );


    // =============================================
    // SUPABASE RETURNED AN ERROR
    // =============================================

    if (error) {

      console.error(
        "Password recovery error:",
        error,
        errorDescription
      );


      showStatus(

        errorDescription
          ? decodeURIComponent(
              errorDescription
                .replace(/\+/g, " ")
            )
          : "This password reset link is invalid or has expired.",

        "error"

      );


      disableForm();

      cleanUrl();

      return;

    }


    // =============================================
    // VERIFY RECOVERY TOKEN
    // =============================================

    if (!token) {

      showStatus(
        "This password reset link is invalid or has expired. Please request a new one.",
        "error"
      );


      disableForm();

      return;

    }


    // Supabase normally supplies type=recovery.
    // If type exists and is something else,
    // do not accept it as a password reset session.

    if (
      type &&
      type !== "recovery"
    ) {

      showStatus(
        "This link is not a valid password recovery link.",
        "error"
      );


      disableForm();

      cleanUrl();

      return;

    }


    accessToken =
      token;


    recoveryReady =
      true;


    // Remove access token from visible browser URL
    // after reading it.

    cleanUrl();


    showStatus(
      "Recovery link verified. Enter your new password below.",
      "success"
    );

  }



  // =====================================================
  // CLEAN TOKEN FROM URL
  // =====================================================

  function cleanUrl() {

    try {

      const cleanPath =

        window.location.pathname +

        window.location.search;


      window.history.replaceState(

        {},

        document.title,

        cleanPath

      );


    } catch (error) {

      console.warn(
        "Unable to clean recovery URL:",
        error
      );

    }

  }



  // =====================================================
  // DISABLE FORM
  // =====================================================

  function disableForm() {

    recoveryReady =
      false;


    if (newPasswordInput) {

      newPasswordInput.disabled =
        true;

    }


    if (confirmPasswordInput) {

      confirmPasswordInput.disabled =
        true;

    }


    if (resetButton) {

      resetButton.disabled =
        true;

    }

  }



  // =====================================================
  // PASSWORD VALIDATION
  // =====================================================

  function validatePassword(
    password,
    confirmation
  ) {

    if (
      !password ||
      !confirmation
    ) {

      return "Enter and confirm your new password.";

    }


    if (
      password.length <
      10
    ) {

      return "Use a password with at least 10 characters.";

    }


    if (
      password.length >
      128
    ) {

      return "Password is too long.";

    }


    if (
      password !==
      confirmation
    ) {

      return "Passwords do not match.";

    }


    return null;

  }



  // =====================================================
  // UPDATE PASSWORD
  // =====================================================

  async function updatePassword(
    password
  ) {

    if (
      !recoveryReady ||
      !accessToken
    ) {

      throw new Error(
        "RESET_SESSION_MISSING"
      );

    }


    const response =
      await fetch(

        `${SUPABASE_URL}/auth/v1/user`,

        {

          method:
            "PUT",

          headers: {

            apikey:
              SUPABASE_PUBLISHABLE_KEY,

            Authorization:
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

      let message =
        "Unable to update password.";


      try {

        const result =
          await response.json();


        message =
          result.message ||
          result.error_description ||
          result.error ||
          message;


      } catch {

        // Keep generic message.

      }


      throw new Error(
        message
      );

    }


    return response.json();

  }



  // =====================================================
  // FORM SUBMISSION
  // =====================================================

  if (resetForm) {

    resetForm.addEventListener(
      "submit",
      async event => {

        event.preventDefault();


        clearStatus();


        if (
          !recoveryReady ||
          !accessToken
        ) {

          showStatus(
            "This password reset link is invalid or has expired. Please request a new one.",
            "error"
          );

          return;

        }


        const password =
          newPasswordInput
            ?.value ||
          "";


        const confirmation =
          confirmPasswordInput
            ?.value ||
          "";


        const validationError =
          validatePassword(
            password,
            confirmation
          );


        if (validationError) {

          showStatus(
            validationError,
            "error"
          );

          return;

        }


        if (resetButton) {

          resetButton.disabled =
            true;


          resetButton.textContent =
            "Updating...";

        }


        if (newPasswordInput) {

          newPasswordInput.disabled =
            true;

        }


        if (confirmPasswordInput) {

          confirmPasswordInput.disabled =
            true;

        }


        try {

          await updatePassword(
            password
          );


          // Do not keep recovery token around.

          accessToken =
            null;


          recoveryReady =
            false;


          resetForm.reset();


          showStatus(

            "Password updated successfully. Redirecting to Admin Login...",

            "success"

          );


          window.setTimeout(
            () => {

              window.location.replace(
                "admin.html"
              );

            },
            1800
          );


        } catch (error) {

          console.error(
            "Password update error:",
            error
          );


          if (
            error.message ===
            "RESET_SESSION_MISSING"
          ) {

            showStatus(
              "This password reset link is invalid or has expired. Please request a new one.",
              "error"
            );


          } else {

            showStatus(
              error.message ||
              "Unable to update your password. The reset link may have expired.",
              "error"
            );

          }


          if (newPasswordInput) {

            newPasswordInput.disabled =
              false;

          }


          if (confirmPasswordInput) {

            confirmPasswordInput.disabled =
              false;

          }


        } finally {

          if (
            resetButton &&
            accessToken
          ) {

            resetButton.disabled =
              false;


            resetButton.textContent =
              "Update Password";

          }

        }

      }
    );

  }



  // =====================================================
  // INITIALIZE
  // =====================================================

  readRecoverySession();


})();