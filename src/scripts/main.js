import { Overlay } from '../components/overlay/overlay.js';
import { Slider } from '../components/slider/slider.js';
import { Catalog } from '../components/catalog/catalog.js';
import { Header } from '../components/header/header.js';

document.addEventListener('DOMContentLoaded', () => {
  window.app = window.app || {};
  
  window.app.overlay = new Overlay();
  
  const sliders = document.querySelectorAll('.slider');
  sliders.forEach(container => {
    new Slider(container);
  });
  
  const catalogContainer = document.querySelector('.catalog');
  if (catalogContainer) {
    window.app.catalog = new Catalog(catalogContainer);
  }
  
  window.app.header = new Header();
});