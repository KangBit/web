let slideIndex = 0;

const swiper = document.getElementById("swiper");
const swiperWrapper = document.getElementById("swiper-wrapper");

const leftButton = document.getElementById("swiper-left-button");
const rightButton = document.getElementById("swiper-right-button");

leftButton.addEventListener("click", () => {
  slideIndex = Math.max(0, slideIndex - 1);

  slideAction();
});

rightButton.addEventListener("click", () => {
  slideIndex = Math.min(4, slideIndex + 1);

  slideAction();
});

function slideAction() {
  const translateX = slideIndex * 100;
  swiperWrapper.style.transform = `translate(-${translateX}%, 0)`;
}
