/** Query Selector */
const slideWrapper = document.getElementById("slide-wrapper");
const prevButton = document.getElementById("slider-prev-button");
const nextButton = document.getElementById("slider-next-button");

const slides = document.querySelectorAll("#slide-wrapper .slide-item");

/** Variables */
const loop = true;
const autoPlay = false;
const autoPlayDelay = 400;
const slideCount = slides.length;

let timeout;
let slideIndex = 0;
let isSliding = false;

/** Functions */
const insertCloneSlides = () => {
  const firstSlide = slides[0];
  const lastSlide = slides[slides.length - 1];

  const cloneFirstSlide = firstSlide.cloneNode(true);
  const cloneLastSlide = lastSlide.cloneNode(true);

  slideWrapper.insertBefore(cloneLastSlide, firstSlide);
  slideWrapper.appendChild(cloneFirstSlide);
};

const teleportTo = (index) => {
  slideIndex = index;

  const translateX = index * -100;
  slideWrapper.style.transform = `translate3d(${translateX}%, 0, 0)`;
};

const slideTo = (index) => {
  slideIndex = index;
  isSliding = true;

  const translateX = index * -100;
  slideWrapper.style.transitionDuration = "300ms";
  slideWrapper.style.transform = `translate3d(${translateX}%, 0, 0)`;
};

const autoSlideAfter = (delay) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    if (isSliding) {
      return;
    }

    slideTo(slideIndex + 1);
  }, delay);
};

const onClickPrevButton = () => {
  if (!loop && slideIndex === 0) {
    return;
  }
  if (isSliding) {
    return;
  }

  slideTo(slideIndex - 1);
};

const onClickNextButton = () => {
  if (!loop && slideIndex === slideCount - 1) {
    return;
  }
  if (isSliding) {
    return;
  }

  slideTo(slideIndex + 1);
};

const onTransitionEnd = () => {
  isSliding = false;

  slideWrapper.style.transitionDuration = "0ms";

  if (slideIndex < 0) {
    teleportTo(slideCount - 1);
  }

  if (slideIndex > slideCount - 1) {
    teleportTo(0);
  }

  if (autoPlay) {
    autoSlideAfter(autoPlayDelay);
  }
};

const setEventListeners = () => {
  prevButton.addEventListener("click", onClickPrevButton);
  nextButton.addEventListener("click", onClickNextButton);

  slideWrapper.addEventListener("transitionend", onTransitionEnd);
};

setEventListeners();

if (loop) {
  insertCloneSlides();
  slideWrapper.style.left = `-100%`;
}

if (autoPlay) {
  autoSlideAfter(autoPlayDelay);
}
