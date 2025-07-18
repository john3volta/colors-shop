export class Overlay {
  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'overlay';
    document.body.appendChild(this.overlay);
  }
  
  show() {
    this.overlay.classList.add('overlay--active');
  }
  
  hide() {
    this.overlay.classList.remove('overlay--active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.overlay = new Overlay();
}); 