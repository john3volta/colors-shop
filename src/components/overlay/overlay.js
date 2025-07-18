class Overlay {
  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'overlay';
    document.body.appendChild(this.overlay);
    
    this.overlay.addEventListener('click', function() {
      this.hide();
    }.bind(this));
  }
  
  show() {
    this.overlay.classList.add('overlay--active');
  }
  
  hide() {
    this.overlay.classList.remove('overlay--active');
  }
}

window.overlay = new Overlay();

export { Overlay }; 