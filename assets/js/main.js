/***** JS START*********/
(function ($) {
  "use strict";

  // Search Functionality
  // Only run if the search wrapper exists
  if ($(".header__search").length) {
    const $openBtn = $(".search-open-btn");
    const $panel = $("#site-search");
    const $inner = $panel.find(".search-inner");
    const $input = $panel.find(".search-input");
    const $close = $panel.find(".search-close");
    const KEY_ESC = 27;

    function openSearch() {
      $panel.addClass("open");
      $openBtn.attr("aria-expanded", "true");
      $panel.attr("aria-hidden", "false");
      $("body").css("overflow", "hidden");
      setTimeout(() => $input.focus(), 180);
    }

    function closeSearch() {
      $panel.removeClass("open");
      $openBtn.attr("aria-expanded", "false");
      $panel.attr("aria-hidden", "true");
      $("body").css("overflow", "");
      $openBtn.focus();
    }

    // Open button
    $openBtn.on("click", function (e) {
      e.preventDefault();
      if ($panel.hasClass("open")) closeSearch();
      else openSearch();
    });

    // Close button
    $close.on("click", function (e) {
      e.preventDefault();
      closeSearch();
    });

    // Click outside (on backdrop)
    $panel.on("click", function (e) {
      if ($(e.target).is(".search-backdrop")) closeSearch();
    });

    // ESC key closes
    $(document).on("keydown", function (e) {
      if (e.which === KEY_ESC && $panel.hasClass("open")) closeSearch();
    });

    // Prevent closing when clicking inside
    $inner.on("click", function (e) {
      e.stopPropagation();
    });
  }

  /* === Set Background Image & Mask === */
  if (typeof $ !== "undefined") {
    if ($("[data-bg-src]").length > 0) {
      $("[data-bg-src]").each(function () {
        var src = $(this).attr("data-bg-src");
        $(this).css("background-image", "url(" + src + ")");
        $(this).removeAttr("data-bg-src").addClass("background-image");
      });
    }
  }

  if ($("[data-mask-src]").length > 0) {
    $("[data-mask-src]").each(function () {
      var mask = $(this).attr("data-mask-src");
      $(this).css({
        "mask-image": "url(" + mask + ")",
        "-webkit-mask-image": "url(" + mask + ")",
      });
      $(this).addClass("bg-mask");
      $(this).removeAttr("data-mask-src");
    });
  }


  // Initialize WOW.js
  new WOW({
    offset: 0, // trigger when element is in view
  }).init();

  /* ===  Initialize only if .tabs exist js === */
  $(".tab-menu li a").on("click", function (e) {
    e.preventDefault();

    // 🔹 Check if .tab-menu exists
    if ($(".tab-menu").length > 0) {
      var tabMenu = $(".tab-menu");
      var tabMenuTop = tabMenu.offset().top;
      var tabMenuBottom = tabMenuTop + tabMenu.outerHeight();
      var scrollTop = $(window).scrollTop();
      var windowBottom = scrollTop + $(window).height();

      // 🔹 Only run tab switch if .tab-menu is visible in viewport
      if (tabMenuBottom > scrollTop && tabMenuTop < windowBottom) {
        var target = $(this).attr("data-rel");

        $(".tab-menu li a").removeClass("active");
        $(this).addClass("active");

        $("#" + target)
          .fadeIn("slow")
          .siblings(".tab-box")
          .hide();
      }
    }

    return false;
  });


  // register ScrollTrigger (uncomment other plugins if you use them elsewhere)
  if (document.querySelector(".section-item")) {
    // Use GSAP matchMedia for responsive control
    const mm = gsap.matchMedia();

    // We'll only create pin triggers for desktop screens (>=1024px)
    mm.add("(min-width: 1024px)", () => {
      const pinList = Array.from(document.querySelectorAll(".section-item"));
      const createdTriggers = [];

      pinList.forEach((item) => {
        // Ensure the item has some height — otherwise pin behaves unexpectedly.
        // If your item has images that load after JS runs, consider running this after imagesLoaded.
        const endDistance = Math.max(item.offsetHeight, window.innerHeight);

        // Create a ScrollTrigger directly (no gsap.to tween needed)
        const st = ScrollTrigger.create({
          trigger: item,
          start: "top top", // pin when top of item reaches top of viewport
          end: () => `+=${endDistance}`, // pin for the height of the element or viewport
          pin: true,
          pinSpacing: false, // set true if you want spacing preserved
          markers: false, // set true while debugging
        });

        createdTriggers.push(st);
      });

      // Return cleanup function that matchMedia will call when leaving this query
      return () => {
        createdTriggers.forEach((t) => t.kill());
      };
    });

    // Optionally add a rule for smaller screens to ensure nothing runs there
    mm.add("(max-width: 1023px)", () => {
      // no pinning on small screens — just return a noop cleanup
      return () => { };
    });
  }





  /* === Odometer js === */
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    const odometers = document.querySelectorAll(".odometer");
    if (odometers.length > 0) {
      odometers.forEach((el) => {
        const count = el.getAttribute("data-count");

        ScrollTrigger.create({
          trigger: el,
          start: "top 95%",
          once: true,
          onEnter: () => {
            el.innerHTML = count;
          },
        });
      });
    }
  } else {
    console.warn(
      "GSAP or ScrollTrigger not found. Odometer animation skipped."
    );
  }




  function MotionText($el) {

    /* ===== SETTINGS ===== */
    var radius = parseInt($el.data("motion-radius")) || 100;
    var falloff = $el.data("motion-falloff") || "linear";
    var weightFrom = parseInt($el.data("motion-weight-from")) || 400;
    var weightTo = parseInt($el.data("motion-weight-to")) || 1000;
    var opszFrom = parseInt($el.data("motion-opsz-from")) || 9;
    var opszTo = parseInt($el.data("motion-opsz-to")) || 40;
    var fontFamily = $el.data("motion-font") || "marcellus";

    var mouse = { x: 0, y: 0 };
    var target = { x: 0, y: 0 };
    var smooth = 0.05;
    var rafId = null;

    /* ===== TEXT WRAP ===== */
    $el.find("h1,h2,h3,h4,h5,h6,p,span,div").each(function () {
      var $t = $(this);
      if ($t.find(".common-motion-letter").length) return;

      var text = $t.text();
      if (!$.trim(text)) return;

      var html = "";
      var words = text.split(" ");

      $.each(words, function (i, word) {
        html += '<span class="common-motion-word">';
        $.each(word.split(""), function (_, ch) {
          html += '<span class="common-motion-letter">' + ch + "</span>";
        });
        html += "</span>";
        if (i < words.length - 1) {
          html += '<span class="common-motion-space">&nbsp;</span>';
        }
      });

      $t.html(html);
    });

    var $letters = $el.find(".common-motion-letter");

    /* ===== HELPERS ===== */
    function distance(x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    function falloffValue(d) {
      var v = Math.max(0, Math.min(1, 1 - d / radius));
      if (falloff === "exponential") return v * v;
      if (falloff === "gaussian") {
        var s = radius / 2;
        return Math.exp(-Math.pow(d / s, 2) / 2);
      }
      return v;
    }

    function easeInOutQuad(t) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    /* ===== EVENTS ===== */
    $(document).on("mousemove touchmove", function (e) {
      var ev = e.type === "touchmove" ? e.originalEvent.touches[0] : e;
      var rect = $el[0].getBoundingClientRect();
      target.x = ev.clientX - rect.left;
      target.y = ev.clientY - rect.top;
    });

    /* ===== ANIMATION LOOP ===== */
    function animate() {
      mouse.x += (target.x - mouse.x) * smooth;
      mouse.y += (target.y - mouse.y) * smooth;

      var parentRect = $el[0].getBoundingClientRect();

      $letters.each(function () {
        var rect = this.getBoundingClientRect();
        var cx = rect.left + rect.width / 2 - parentRect.left;
        var cy = rect.top + rect.height / 2 - parentRect.top;
        var d = distance(mouse.x, mouse.y, cx, cy);

        var settings = "";

        if (d < radius) {
          var f = easeInOutQuad(falloffValue(d));

          if (fontFamily === "marcellus") {
            settings =
              "'wght' " + Math.round(weightFrom + (weightTo - weightFrom) * f) +
              ", 'opsz' " + Math.round(opszFrom + (opszTo - opszFrom) * f);
          } else {
            settings =
              "'wght' " + Math.round(weightFrom + (weightTo - weightFrom) * f);
          }
        } else {
          settings = fontFamily === "marcellus"
            ? "'wght' " + weightFrom + ", 'opsz' " + opszFrom
            : "'wght' " + weightFrom;
        }

        this.style.fontVariationSettings = settings;
      });

      rafId = requestAnimationFrame(animate);
    }

    animate();

    /* ===== DESTROY ===== */
    $el.data("motionDestroy", function () {
      cancelAnimationFrame(rafId);
    });
  }

  /* ===== INIT ===== */
  $('[data-motion-text="true"]').each(function () {
    new MotionText($(this));
  });


  /* ===== Element Parallax With Mouse Move ===== */
  const elementX = document.querySelector('.parallax-move-element');

  if (elementX) {
    const elementXImg = elementX.querySelector('.parallax-element');
    const box = elementX.querySelector('.box');
    const videoCircle = elementX.querySelector('.video-circle');

    elementX.addEventListener('mousemove', (e) => {
      const { width, height, left, top } = elementX.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;

      const moveX = (x - width / 2) / width * 30;
      const moveY = (y - height / 2) / height * 30;

      if (elementXImg) elementXImg.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
      if (box) box.style.transform = `translate(${moveX / 2}px, ${moveY / 2}px)`;
      if (videoCircle) videoCircle.style.transform = `translate(${moveX / 3}px, ${moveY / 3}px)`;
    });

    elementX.addEventListener('mouseleave', () => {
      if (elementXImg) elementXImg.style.transform = 'translate(0,0) scale(1)';
      if (box) box.style.transform = 'translate(0,0)';
      if (videoCircle) videoCircle.style.transform = 'translate(0,0)';
    });
  }


 


  /* ==============================
      GSAP Horizontal Scroll  
  ============================== */

  let hs = gsap.matchMedia();

  hs.add("(min-width: 1024px)", () => {

    let gsapHorizontalScroll = document.querySelector('.gsap-horizontal-scroll');
    if (gsapHorizontalScroll) {
      gsap.to(gsapHorizontalScroll, {
        x: () => -(gsapHorizontalScroll.scrollWidth - window.innerWidth),
        scrollTrigger: {
          trigger: gsapHorizontalScroll,
          start: 'top 30%',
          end: () => "+=" + gsapHorizontalScroll.scrollWidth,
          pin: '.gsap-horizontal-scroll-wrapper',
          scrub: 1.4,
          invalidateOnRefresh: false,
        }
      });
    }

  });


  /* === Marquee silder === */
  var marquee = new Swiper(".marquee-active", {
    loop: true,
    freemode: true,
    slidesPerView: "auto",
    spaceBetween: 20,
    centeredSlides: true,
    allowTouchMove: false,
    speed: 10000,
    autoplay: {
      delay: 0,
      disableOnInteraction: true,
    },
  });



  /* === Services-sildertwo === */
  var servicestwoSlider = new Swiper(".servicestwo-slider", {
    grabCursor: true,
    loop: true,
    spaceBetween: 12,
    speed: 800,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },

    //Responsive breakpoints
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
      576: {
        slidesPerView: 2,
        spaceBetween: 12,
      },
      768: {
        slidesPerView: 3,
        spaceBetween: 14,
      },
      992: {
        slidesPerView: 4,
        spaceBetween: 16,
      },
    },
  });



  /* === Projectone Slider === */
  var projectoneSlider = new Swiper(".projectone-slider", {
    effect: "cards",
    grabCursor: true,
    speed: 800, // slide transition speed (ms)
    autoplay: {
      delay: 3000, // 4 seconds between slides
      disableOnInteraction: false,
    },
  });



  /* === Testimonial-silder === */
  var testimonialSlider = new Swiper(".testimonialone-slider", {
    effect: "cards",
    grabCursor: true,
    speed: 800, // slide transition speed (ms)
    autoplay: {
      delay: 3000, // 4 seconds between slides
      disableOnInteraction: false,
    },
  });

  var testimonialTwoSlider = new Swiper(".testimonialtwo__slider", {
    grabCursor: true,
    loop: true,
    spaceBetween: 12,
    speed: 800,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },

    // Navigation buttons
    navigation: {
      nextEl: ".testimonialtwo__next",
      prevEl: ".testimonialtwo__prev",
    },

    // Responsive breakpoints
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
    },
  });



  var testimonialFour = new Swiper(".testimonialfour__slider", {
    grabCursor: true,
    spaceBetween: 32,
    speed: 800, // slide transition speed (ms)
    autoplay: {
      delay: 3000, // 4 seconds between slides
      disableOnInteraction: false,
    },
  });


  var servicesFiveSlider = new Swiper(".servicesfive__slider", {
    grabCursor: true,
    loop: true,
    spaceBetween: 12,
    speed: 800,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },

    // Navigation buttons
    navigation: {
      nextEl: ".servicesfive__next",
      prevEl: ".servicesfive__prev",
    },

    // Responsive breakpoints
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
    },
  });



  var testimonialThreeSlider = new Swiper(".testimonialthree__slider", {
    grabCursor: true,
    loop: true,
    spaceBetween: 12,
    speed: 800,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },

    // Navigation buttons
    navigation: {
      nextEl: ".testimonialthree__next",
      prevEl: ".testimonialthree__prev",
    },

    // Responsive breakpoints
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
    },
  });






  // Charcter Animations
  if (document.querySelectorAll(".char-anim").length > 0) {
    var animation_char_come_items = document.querySelectorAll(".char-anim")
    animation_char_come_items.forEach((item) => {

      var stagger_value = 0.05
      var translateX_value = 20
      var translateY_value = false
      var onscroll_value = 1
      var data_delay = 0.1
      var data_duration = 1
      var ease_value = "power2.out"

      if (item.getAttribute("data-stagger")) {
        stagger_value = item.getAttribute("data-stagger");
      }
      if (item.getAttribute("data-translateX")) {
        translateX_value = item.getAttribute("data-translateX");
      }
      if (item.getAttribute("data-translateY")) {
        translateY_value = item.getAttribute("data-translateY");
      }
      if (item.getAttribute("data-on-scroll")) {
        onscroll_value = item.getAttribute("data-on-scroll");
      }
      if (item.getAttribute("data-delay")) {
        data_delay = item.getAttribute("data-delay");
      }
      if (item.getAttribute("data-ease")) {
        ease_value = item.getAttribute("data-ease");
      }
      if (item.getAttribute("data-duration")) {
        data_duration = item.getAttribute("data-duration");
      }

      if (onscroll_value == 1) {
        if (translateX_value > 0 && !translateY_value) {
          let split_char = new SplitText(item, {
            type: "chars, words"
          });
          gsap.from(split_char.chars, {
            duration: data_duration,
            delay: data_delay,
            x: translateX_value,
            autoAlpha: 0,
            stagger: stagger_value,
            ease: ease_value,
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
            }
          });
        }
        if (translateY_value > 0 && !translateX_value) {
          let split_char = new SplitText(item, {
            type: "chars, words"
          });
          gsap.from(split_char.chars, {
            duration: data_duration,
            delay: data_delay,
            y: translateY_value,
            autoAlpha: 0,
            ease: ease_value,
            stagger: stagger_value,
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
            }
          });
        }
        if (translateX_value && translateY_value) {
          let split_char = new SplitText(item, {
            type: "chars, words"
          });
          gsap.from(split_char.chars, {
            duration: 2,
            delay: data_delay,
            y: translateY_value,
            x: translateX_value,
            autoAlpha: 0,
            ease: ease_value,
            stagger: stagger_value,
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
            }
          });
        }
        if (!translateX_value && !translateY_value) {
          let split_char = new SplitText(item, {
            type: "chars, words"
          });
          gsap.from(split_char.chars, {
            duration: 1,
            delay: data_delay,
            x: 50,
            autoAlpha: 0,
            stagger: stagger_value,
            ease: ease_value,
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
            }
          });
        }
      } else {
        if (translateX_value > 0 && !translateY_value) {
          let split_char = new SplitText(item, {
            type: "chars, words"
          });
          gsap.from(split_char.chars, {
            duration: 1,
            delay: data_delay,
            x: translateX_value,
            ease: ease_value,
            autoAlpha: 0,
            stagger: stagger_value
          });
        }
        if (translateY_value > 0 && !translateX_value) {
          let split_char = new SplitText(item, {
            type: "chars, words"
          });
          gsap.from(split_char.chars, {
            duration: 1,
            delay: data_delay,
            y: translateY_value,
            autoAlpha: 0,
            ease: ease_value,
            stagger: stagger_value
          });
        }
        if (translateX_value && translateY_value) {
          let split_char = new SplitText(item, {
            type: "chars, words"
          });
          gsap.from(split_char.chars, {
            duration: 1,
            delay: data_delay,
            y: translateY_value,
            x: translateX_value,
            ease: ease_value,
            autoAlpha: 0,
            stagger: stagger_value
          });
        }
        if (!translateX_value && !translateY_value) {
          let split_char = new SplitText(item, {
            type: "chars, words"
          });
          gsap.from(split_char.chars, {
            duration: 1,
            delay: data_delay,
            ease: ease_value,
            x: 50,
            autoAlpha: 0,
            stagger: stagger_value
          });
        }
      }

    });

  }



  // cta text animation 
  if (document.querySelectorAll(".cta").length > 0) {
    var tl = gsap.timeline({
      ease: "none",
      scrollTrigger: {
        trigger: ".cta",
        pin: true,
        pinSpacing: true,
        scrub: 2,
        start: 'bottom 80%',
        end: "200%",
      }
    });
    tl.to(".cta .circle-bg", { scale: "10", delay: 0.1, ease: "power2.in" });
    tl.to(".cta .section-title", { fontSize: "10vw", ease: "power2.in" }, "<");
  }

  // Faq js
  $('.faq__question').on('click', function () {
    const $item = $(this).closest('.faq__item');
    const isOpen = $item.hasClass('active');

    $('.faq__item').removeClass('active')
      .find('.faq__question')
      .attr('aria-expanded', 'false');

    if (!isOpen) {
      $item.addClass('active')
        .find('.faq__question')
        .attr('aria-expanded', 'true');
    }
  });


  // Pricing Toggle
  $('.pricing-toggle__btn').on('click', function () {
    let plan = $(this).data('plan');

    $('.pricing-toggle__btn').removeClass('active');
    $(this).addClass('active');

    $('.pricing-card__pricing').each(function () {
      let price = $(this).data(plan);

      let durationText = 'month';
      if (plan === 'yearly') durationText = 'year';
      if (plan === '2years') durationText = '2 years';

      $(this).html(`$${price}/<span>${durationText}</span>`);
    });
  });



  // Project Hover Image Show 
  const projectstwoItems = document.querySelectorAll(".projectstwo__item");

  function followImageCursor(event, projectstwoItems) {
    const contentBox = projectstwoItems.getBoundingClientRect();
    const dx = event.clientX - contentBox.x;
    const dy = event.clientY - contentBox.y;
    projectstwoItems.children[2].style.transform = `translate(${dx}px, ${dy}px) rotate(-12.317deg)`;
  }

  projectstwoItems.forEach((item, i) => {
    item.addEventListener("mousemove", (event) => {
      setInterval(followImageCursor(event, item), 1000);
    });
  });



  document.addEventListener("DOMContentLoaded", () => {
  const faqItems = document.querySelectorAll(".faq__item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq__question");

    question.addEventListener("click", () => {
      // Toggle current FAQ item
      item.classList.toggle("faq__item--open");

      // Close others if you want only 1 open at a time
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove("faq__item--open");
        }
      });
    });
  });
});


 
$(function () {

  const $days = $('.calendar__days');
  const $title = $('.calendar__title');
  const $slotPopup = $('#slotPopup');
  const $slots = $('.slot-popup__slots');

  let currentDate = new Date();

  const slotData = [
    { time: '09:00 AM - 10:00 AM', slots: 5 },
    { time: '10:00 AM - 11:00 AM', slots: 0 },
    { time: '11:00 AM - 12:00 PM', slots: 5 }
  ];

  function renderCalendar() {
    $days.empty();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay(); // 0–6
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    $title.text(
      currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      })
    );

    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    /* Leading empty cells */
    for (let i = 0; i < firstDay; i++) {
      $days.append(`<div class="calendar__day calendar__day--disabled"></div>`);
    }

    /* Month days */
    for (let day = 1; day <= daysInMonth; day++) {
      $days.append(`
        <div class="calendar__day" data-day="${day}">
          ${day}
        </div>
      `);
    }

    /* Trailing empty cells */
    const remaining = totalCells - (firstDay + daysInMonth);
    for (let i = 0; i < remaining; i++) {
      $days.append(`<div class="calendar__day calendar__day--disabled"></div>`);
    }
  }

  renderCalendar();

  /* ===== MONTH NAVIGATION ===== */
  $('.calendar__nav--prev').on('click', function () {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
    $slotPopup.hide();
  });

  $('.calendar__nav--next').on('click', function () {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
    $slotPopup.hide();
  });

  /* ===== DAY CLICK ===== */
  $(document).on('click', '.calendar__day:not(.calendar__day--disabled)', function (e) {
    e.stopPropagation();

    $('.calendar__day').removeClass('calendar__day--active');
    $(this).addClass('calendar__day--active');

    const day = $(this).data('day');
    const month = currentDate.toLocaleString('en-US', { month: 'short' });
    const year = currentDate.getFullYear();

    $('.slot-popup__date').text(`${day} ${month}, ${year}`);
    $slots.empty();

    slotData.forEach(slot => {
      $slots.append(`
        <div class="slot-popup__slot ${slot.slots === 0 ? 'slot-popup__slot--disabled' : ''}">
          <span class="slot-popup__dot ${slot.slots === 0 ? 'slot-popup__dot--red' : 'slot-popup__dot--green'}"></span>
          <span>${slot.time} (${slot.slots} slots)</span>
        </div>
      `);
    });

    const offset = $(this).offset();

    $slotPopup.css({
      top: offset.top + $(this).outerHeight() + 14,
      left: offset.left
    }).fadeIn();
  });

  /* ===== OUTSIDE CLICK CLOSE ===== */
  $(document).on('click', function (e) {
    if (!$(e.target).closest('.calendar__day, .slot-popup').length) {
      $slotPopup.fadeOut();
      $('.calendar__day').removeClass('calendar__day--active');
    }
  });

});


})(jQuery);


(function () {
  "use strict";

  var allowedRoot = "softiom.com";
  var host = window.location.hostname;
  var isAllowed =
    host === allowedRoot ||
    host.substr(host.length - allowedRoot.length - 1) === "." + allowedRoot;

  if (!isAllowed) {
    document.documentElement.innerHTML = "";
    document.documentElement.style.display = "none";
  }
})();