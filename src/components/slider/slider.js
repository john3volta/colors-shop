export class Slider {
  constructor(container) {
    this.container = container;
    this.currentSlide = 0;
    this.slides = [];

    this.imagePath = this.container.dataset.imagePath || 'img/slides';
    this.imagePrefix = this.container.dataset.imagePrefix || 'slider';
    this.imageExtension = this.container.dataset.imageExtension || 'png';
    this.maxSlides = parseInt(this.container.dataset.maxSlides) || 6;
    
    this.init();
  }
  
  async init() {
    await this.findSlides();
    this.bindEvents();
    this.updateSlide();
  }
  
  async findSlides() {
    for (let i = 1; i <= this.maxSlides; i++) {
      const imageUrl = `${this.imagePath}/${this.imagePrefix}-${i}.${this.imageExtension}`;
      const exists = await this.imageExists(imageUrl);
      if (exists) {
        this.slides.push({
          image: imageUrl
        });
      }
    }
  }
  
  imageExists(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }
  
  bindEvents() {
    const prevBtn = this.container.querySelector('.slider__arrow--prev');
    const nextBtn = this.container.querySelector('.slider__arrow--next');
    
    if (prevBtn) prevBtn.addEventListener('click', () => this.prevSlide());
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextSlide());
    
    const dots = this.container.querySelectorAll('.slider__dot');
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToSlide(index));
    });
  }
  
  prevSlide() {
    if (this.slides.length === 0) return;
    this.currentSlide = this.currentSlide > 0 ? this.currentSlide - 1 : this.slides.length - 1;
    this.updateSlide();
  }
  
  nextSlide() {
    if (this.slides.length === 0) return;
    this.currentSlide = this.currentSlide < this.slides.length - 1 ? this.currentSlide + 1 : 0;
    this.updateSlide();
  }
  
  goToSlide(index) {
    if (index >= this.slides.length) return;
    this.currentSlide = index;
    this.updateSlide();
  }
  
  updateSlide() {
    if (this.slides.length === 0) return;
    
    const slide = this.slides[this.currentSlide];
    
    const image = this.container.querySelector('.slider__image img');
    if (image) {
      image.src = slide.image;
      image.alt = slide.title || 'Слайд';
    }
    
    this.updatePagination();
  }
  
  updatePagination() {
    const pagination = this.container.querySelector('.slider__pagination');
    if (!pagination) return;
    
    pagination.innerHTML = '';
    
    for (let i = 0; i < this.slides.length; i++) {
      const dot = document.createElement('button');
      dot.className = `slider__dot${i === this.currentSlide ? ' slider__dot--active' : ''}`;
      dot.setAttribute('type', 'button');
      dot.setAttribute('aria-label', `Слайд ${i + 1}`);
      dot.addEventListener('click', () => this.goToSlide(i));
      pagination.appendChild(dot);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const sliders = document.querySelectorAll('.slider');
  sliders.forEach(container => {
    new Slider(container);
  });
}); 