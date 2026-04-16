
/* MODAL ================================= */
let baseZIndex = 1000;
document.addEventListener('click', (e) => {
    const isCloseBtn = e.target.closest('[data-close]');
    const isOverlay = e.target.classList.contains('modal-overlay');
    if (isCloseBtn) {
        const activeModal = e.target.closest('.modal-overlay');
        if (activeModal) {
            activeModal.classList.remove('active');
            if (document.querySelectorAll('.modal-overlay.active').length === 0) {
                document.body.classList.remove('modal-open');
            }
            setTimeout(() => { activeModal.style.zIndex = ''; }, 300);
        }
    }
});
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const activeModals = Array.from(document.querySelectorAll('.modal-overlay.active'));
        if (activeModals.length > 0) {
            // Sort by z-index and close the highest one
            activeModals.sort((a, b) => b.style.zIndex - a.style.zIndex);
            activeModals[0].classList.remove('active');
        }
    }
});
function toggleModalById(id, action = 'open') {
    const modal = document.querySelector(id);
    if (!modal) return;

    if (action === 'open') {
        const openModals = document.querySelectorAll('.modal-overlay.active').length;
        modal.classList.add('active');
        // Apply stacking z-index
        const baseZIndex = 1000;
        modal.style.zIndex = baseZIndex + (openModals + 1) * 10;
        document.body.classList.add('modal-open');
        //toggleBodyScroll(true);
    } else {
        modal.classList.remove('active');
        if (document.querySelectorAll('.modal-overlay.active').length === 0) {
            document.body.classList.remove('modal-open');
        }
        // Clean up z-index after transition
        setTimeout(() => { modal.style.zIndex = ''; }, 300);
        //toggleBodyScroll(false);
    }
}
function toggleBodyScroll(isLocked) {
    if (isLocked) {
        document.body.classList.add('modal-open');
    } else {
        document.body.classList.remove('modal-open');
    }
}
/* MODAL ================================= */