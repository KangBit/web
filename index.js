/** Variables */
const loop = true;

let slideIndex = 0;
let isSliding = false;

/** Query Selector */
const swiper = document.getElementById("swiper");
const swiperWrapper = document.getElementById("swiper-wrapper");

const leftButton = document.getElementById("swiper-left-button");
const rightButton = document.getElementById("swiper-right-button");

const slides = document.querySelectorAll("#swiper-wrapper .swiper-slide");

/** Functions */
const insertCloneSlides = () => {
  const firstSlide = slides[0];
  const lastSlide = slides[slides.length - 1];

  const cloneFirstSlide = firstSlide.cloneNode(true);
  const cloneLastSlide = lastSlide.cloneNode(true);

  swiperWrapper.insertBefore(cloneLastSlide, firstSlide);
  swiperWrapper.appendChild(cloneFirstSlide);
};

const slideTo = (index) => {
  isSliding = true;

  const translateX = index * -100;

  swiperWrapper.style.transitionProperty = "transform";
  swiperWrapper.style.transitionDuration = "0.3s";
  swiperWrapper.style.transform = `translate(${translateX}%, 0)`;
};

const onClickLeftButton = () => {
  if (isSliding) {
    return;
  }

  slideIndex = slideIndex - 1;
  slideTo(slideIndex);
};

const onClickRightButton = () => {
  if (isSliding) {
    return;
  }

  slideIndex = slideIndex + 1;
  slideTo(slideIndex);
};

const onTransitionEnd = () => {
  isSliding = false;

  swiperWrapper.style.transitionProperty = "";
  swiperWrapper.style.transitionDuration = "";

  if (slideIndex < 0) {
    slideIndex = 4;
    swiperWrapper.style.transform = `translate(-400%, 0)`;
  }

  if (slideIndex > 4) {
    slideIndex = 0;
    swiperWrapper.style.transform = `translate(0%, 0)`;
  }
};

const setEventListeners = () => {
  leftButton.addEventListener("click", onClickLeftButton);
  rightButton.addEventListener("click", onClickRightButton);

  swiperWrapper.addEventListener("transitionend", onTransitionEnd);
};

if (loop) {
  insertCloneSlides();
  swiperWrapper.style.left = `-100%`;
}

setEventListeners();

// setInterval(() => {
//   if (isSliding) {
//     return;
//   }
//   slideIndex = slideIndex + 1;
//   slideTo(slideIndex);
// }, 1000);
