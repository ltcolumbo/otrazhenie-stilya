
/*
  Отражение стиля
  Настройте значения перед публикацией сайта.
*/

const CONFIG = {
  // Вставьте адрес подключённого сервиса обработки заявок.
  // Например, URL вашего собственного API или form-сервиса.
  formEndpoint: "",

  // Только username, без @ и без URL.
  telegramUsername: "",

  // Международный формат без пробелов.
  // Пример формата: 375291234567
  whatsappPhone: "",

  // Международный формат с +.
  viberPhone: ""
};

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Закрыть меню" : "Открыть меню"
    );
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Открыть меню");
    });
  });
}

// Актуальный год в подвале.
const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}

// Настройка ссылок мессенджеров.
const messengerLinks = {
  telegram: CONFIG.telegramUsername
    ? `https://t.me/${CONFIG.telegramUsername}`
    : "",

  whatsapp: CONFIG.whatsappPhone
    ? `https://wa.me/${CONFIG.whatsappPhone}`
    : "",

  viber: CONFIG.viberPhone
    ? `viber://chat?number=${encodeURIComponent(CONFIG.viberPhone)}`
    : ""
};

document.querySelectorAll("[data-messenger]").forEach((link) => {
  const messenger = link.dataset.messenger;
  const url = messengerLinks[messenger];

  if (url) {
    link.href = url;

    if (messenger !== "viber") {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
  } else {
    link.href = "#contact";
    link.addEventListener("click", (event) => {
      event.preventDefault();

      const status = document.querySelector("#form-status");

      if (status) {
        status.textContent =
          "Контакт этого мессенджера ещё не настроен. " +
          "Пожалуйста, заполните форму заявки.";
      }
    });
  }
});

// Форма заявки.
const form = document.querySelector("#lead-form");
const formStatus = document.querySelector("#form-status");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const submitButton = form.querySelector('[type="submit"]');
    const data = Object.fromEntries(new FormData(form).entries());

    if (!CONFIG.formEndpoint) {
      if (formStatus) {
        formStatus.textContent =
          "Форма пока не подключена к сервису приёма заявок. " +
          "Заполненные данные не отправлены. Подключите formEndpoint " +
          "в js/main.js перед запуском сайта.";
      }

      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Отправка…";

    try {
      const response = await fetch(CONFIG.formEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          ...data,
          source: window.location.href,
          formName: "Заявка на изготовление зеркала"
        })
      });

      if (!response.ok) {
        throw new Error("Не удалось отправить заявку");
      }

      formStatus.textContent =
        "Спасибо! Заявка отправлена. Мы свяжемся с вами.";

      form.reset();
    } catch (error) {
      formStatus.textContent =
        "Не удалось отправить заявку. Попробуйте позже " +
        "или свяжитесь с нами через настроенный мессенджер.";
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Подготовить заявку <span>↗</span>';
    }
  });
}
