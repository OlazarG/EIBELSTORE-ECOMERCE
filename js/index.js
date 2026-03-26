(function () {
    // === Refund Modal Logic ===
    const overlay = document.getElementById('refund-overlay');
    const openBtn = document.getElementById('open-refund-modal');
    const closeBtn = document.getElementById('close-refund-modal');
    const accordionBtn = document.getElementById('toggle-refund-accordion');
    const accordionContent = document.getElementById('refund-accordion-content');
    const refundIcon = accordionBtn ? accordionBtn.querySelector('.refund-icon') : null;

    function openRefundModal(e) {
        if (e) e.preventDefault();
        if (accordionContent && !accordionContent.classList.contains('hidden')) {
            accordionContent.classList.add('hidden');
            if (refundIcon) refundIcon.classList.remove('open');
        }
        if (overlay) overlay.classList.add('active');
        document.body.classList.add('modal-open');
    }

    function closeRefundModal() {
        if (overlay) overlay.classList.remove('active');
        document.body.classList.remove('modal-open');
    }

    function toggleAccordion(e) {
        if (e) e.preventDefault();
        if (overlay && overlay.classList.contains('active')) {
            closeRefundModal();
        }
        if (accordionContent) accordionContent.classList.toggle('hidden');
        if (refundIcon) refundIcon.classList.toggle('open');
    }

    if (openBtn) openBtn.addEventListener('click', openRefundModal);
    if (closeBtn) closeBtn.addEventListener('click', closeRefundModal);
    if (accordionBtn) accordionBtn.addEventListener('click', toggleAccordion);
    if (overlay) {
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeRefundModal();
        });
    }

    // Global Key Listener
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeRefundModal();
            if (typeof window.closeModal === 'function') window.closeModal();
            if (accordionContent && !accordionContent.classList.contains('hidden')) {
                accordionContent.classList.add('hidden');
                if (refundIcon) refundIcon.classList.remove('open');
            }
        }
    });

    // Delegation for Dynamically added close buttons if any
    document.addEventListener('click', (e) => {
        if (e.target.closest('.close-modal')) {
            if (typeof window.closeModal === 'function') window.closeModal();
        }
    });

})();
