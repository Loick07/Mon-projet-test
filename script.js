/**
 * LIVRER EXPRESS DAKAR - JAVASCRIPT
 * Gestion des interactions : Menu mobile, Calculateur de tarif, Modale de commande, Toast, etc.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 0. Gestion du Thème Sombre / Clair (Dark / Light Theme Toggle) ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const mobileThemeBtn = document.getElementById('mobile-theme-toggle');

    function applyTheme(theme) {
        document.documentElement.classList.add('theme-transitioning');
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            if (mobileThemeBtn) {
                mobileThemeBtn.innerHTML = '<i class="fa-solid fa-sun"></i> <span>Mode Clair</span>';
            }
        } else {
            document.documentElement.removeAttribute('data-theme');
            if (mobileThemeBtn) {
                mobileThemeBtn.innerHTML = '<i class="fa-solid fa-moon"></i> <span>Mode Sombre</span>';
            }
        }

        setTimeout(() => {
            document.documentElement.classList.remove('theme-transitioning');
        }, 380);
    }

    // Détection initiale : préférence stockée ou préférence système
    const savedTheme = localStorage.getItem('livrer_theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme ? savedTheme : (systemPrefersDark ? 'dark' : 'light');
    applyTheme(initialTheme);

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('livrer_theme', newTheme);
        applyTheme(newTheme);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    if (mobileThemeBtn) {
        mobileThemeBtn.addEventListener('click', toggleTheme);
    }

    // Changement dynamique si la préférence système de l'OS change
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('livrer_theme')) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    // --- 1. Gestion du Menu Mobile (Hamburger) ---
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('is-active');
            navMenu.classList.toggle('open');
            document.body.classList.toggle('no-scroll');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('is-active');
                navMenu.classList.remove('open');
                document.body.classList.remove('no-scroll');
            });
        });
    }

    // --- 2. Header avec effet d'ombre au scroll ---
    const header = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- 3. Active Link Highlight au scroll (ScrollSpy) ---
    const sections = document.querySelectorAll('section[id]');
    function highlightActiveLink() {
        const scrollY = window.pageYOffset;
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120;
            const sectionId = current.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);

            if (correspondingLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    correspondingLink.classList.add('active');
                } else {
                    correspondingLink.classList.remove('active');
                }
            }
        });
    }
    window.addEventListener('scroll', highlightActiveLink);

    // --- 4. Calculateur Interactif de Tarifs Dakar ---
    const pickupSelect = document.getElementById('pickup-zone');
    const dropoffSelect = document.getElementById('dropoff-zone');
    const packageSelect = document.getElementById('package-type');
    const priceDisplayFcfa = document.getElementById('calc-price');
    const priceDisplayEur = document.getElementById('calc-price-eur');
    const timeDisplay = document.getElementById('calc-time');
    const btnOrderWhatsApp = document.getElementById('btn-order-whatsapp');

    // Matrice de tarification simplifiée Dakar
    function calculateShippingCost() {
        if (!pickupSelect || !dropoffSelect || !packageSelect) return;

        const pickup = pickupSelect.value;
        const dropoff = dropoffSelect.value;
        const packageType = packageSelect.value;

        let basePrice = 2000;
        let estimatedMinutes = "30 à 45 min";

        // Même quartier
        if (pickup === dropoff) {
            basePrice = 1500;
            estimatedMinutes = "20 à 30 min";
        }
        // Banlieue éloignée
        else if (pickup === 'rufisque' || dropoff === 'rufisque') {
            basePrice = 3500;
            estimatedMinutes = "45 à 65 min";
        }
        else if (pickup === 'banlieue' || dropoff === 'banlieue') {
            basePrice = 2500;
            estimatedMinutes = "35 à 50 min";
        }
        else {
            // Intra-Dakar urbain standard (ex: Plateau <-> Almadies)
            basePrice = 2000;
            estimatedMinutes = "30 à 45 min";
        }

        // Ajustement selon le type de colis
        if (packageType === 'doc') {
            basePrice = Math.max(1500, basePrice - 200);
        } else if (packageType === 'lourd') {
            basePrice += 1000;
        }

        // Conversion approximative en Euro (1 EUR ~ 655.957 XOF)
        const euroPrice = (basePrice / 655.957).toFixed(2);

        // Affichage fluide
        priceDisplayFcfa.textContent = `${basePrice.toLocaleString('fr-FR')} FCFA`;
        priceDisplayEur.textContent = `(~ ${euroPrice.replace('.', ',')} €)`;
        timeDisplay.innerHTML = `<i class="fa-solid fa-stopwatch"></i> Temps estimé : ${estimatedMinutes}`;

        // Feedback visuel et rebond fluide lors du recalcul
        const priceContainer = priceDisplayFcfa.closest('.price-display');
        if (priceContainer) {
            priceContainer.classList.remove('price-updated');
            void priceContainer.offsetWidth; // Forcer le reflow
            priceContainer.classList.add('price-updated');
        }

        // Mise à jour du lien WhatsApp
        const pickupText = pickupSelect.options[pickupSelect.selectedIndex].text;
        const dropoffText = dropoffSelect.options[dropoffSelect.selectedIndex].text;
        const packageText = packageSelect.options[packageSelect.selectedIndex].text;

        const whatsappMessage = encodeURIComponent(
            `Bonjour Livrer Express,\n` +
            `Je souhaite commander une course express à Dakar :\n` +
            `- Départ : ${pickupText}\n` +
            `- Arrivée : ${dropoffText}\n` +
            `- Type : ${packageText}\n` +
            `- Tarif estimé : ${basePrice} FCFA (${euroPrice} €)\n` +
            `Pouvez-vous m'envoyer un coursier rapidement ?`
        );

        if (btnOrderWhatsApp) {
            btnOrderWhatsApp.onclick = () => {
                window.open(`https://wa.me/221778452020?text=${whatsappMessage}`, '_blank');
            };
        }
    }

    if (pickupSelect && dropoffSelect && packageSelect) {
        pickupSelect.addEventListener('change', calculateShippingCost);
        dropoffSelect.addEventListener('change', calculateShippingCost);
        packageSelect.addEventListener('change', calculateShippingCost);
        calculateShippingCost(); // initialisation
    }

    // --- 5. Gestion de la Modale de Commande ---
    const orderModal = document.getElementById('order-modal');
    const modalCloseBtn = document.getElementById('modal-close');
    const modalOverlay = document.getElementById('modal-overlay');
    const openModalButtons = document.querySelectorAll('.open-order-modal');
    const modalFormulaInput = document.getElementById('modal-selected-formula');
    const orderForm = document.getElementById('order-form');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    function openModal(planName = 'Grand Dakar Express (2 500 FCFA)') {
        if (!orderModal) return;
        if (modalFormulaInput && planName) {
            modalFormulaInput.value = planName;
        }
        orderModal.classList.add('active');
        orderModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        if (!orderModal) return;
        orderModal.classList.remove('active');
        orderModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    openModalButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const plan = btn.getAttribute('data-plan') || 'Course Standard Express';
            openModal(plan);
        });
    });

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    // Échap pour fermer la modale
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && orderModal && orderModal.classList.contains('active')) {
            closeModal();
        }
    });

    // --- 6. Soumission du Formulaire de Commande Express ---
    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const clientName = document.getElementById('client-name').value;
            const clientPhone = document.getElementById('client-phone').value;
            const pickupAddr = document.getElementById('pickup-addr').value;
            const deliveryAddr = document.getElementById('delivery-addr').value;
            const packageDesc = document.getElementById('package-desc').value || 'Colis standard';
            const paymentMethod = document.getElementById('payment-method').value;
            const formula = modalFormulaInput ? modalFormulaInput.value : 'Standard';

            // Message WhatsApp prérempli pour transmettre directement au central de répartition à Dakar
            const waMsg = encodeURIComponent(
                `⚡ NOUVELLE COMMANDE LIVRER EXPRESS ⚡\n\n` +
                `👤 Client : ${clientName} (${clientPhone})\n` +
                `📦 Formule : ${formula}\n` +
                `📍 Ramassage : ${pickupAddr}\n` +
                `🎯 Destination : ${deliveryAddr}\n` +
                `📝 Contenu : ${packageDesc}\n` +
                `💳 Règlement : ${paymentMethod.toUpperCase()}\n\n` +
                `Merci de m'assigner un coursier !`
            );

            // Fermer modale
            closeModal();

            // Afficher toast de succès
            showToast(`Merci ${clientName} ! Redirection vers la confirmation WhatsApp...`);

            // Ouvrir WhatsApp après un court délai pour confirmation
            setTimeout(() => {
                window.open(`https://wa.me/221778452020?text=${waMsg}`, '_blank');
                orderForm.reset();
            }, 1200);
        });
    }

    // --- 7. Toast Feedback Utility avec barre de progression synchronisée ---
    let toastTimeout = null;
    function showToast(message) {
        if (!toast || !toastMessage) return;
        if (toastTimeout) clearTimeout(toastTimeout);

        toastMessage.textContent = message;
        toast.classList.remove('show');
        void toast.offsetWidth; // Forcer le reflow pour relancer l'animation
        toast.classList.add('show');

        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 4500);
    }

    // --- 8. Apparitions Fluides au Scroll (Cascade Staggered Reveal) ---
    function initScrollReveal() {
        const revealElements = document.querySelectorAll(
            '.section-header, .step-card, .calculator-box, .pricing-card, .pricing-guarantee-bar, .testimonial-card, .trust-banner, .footer-col'
        );

        if (!revealElements.length) return;

        // Configuration initiale
        revealElements.forEach(el => el.classList.add('reveal-init'));

        // Cascade temporelle pour les cartes dans une même grille
        const grids = document.querySelectorAll('.steps-grid, .pricing-grid, .testimonials-grid, .footer-container');
        grids.forEach(grid => {
            Array.from(grid.children).forEach((child, index) => {
                child.style.transitionDelay = `${index * 120}ms`;
            });
        });

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.12
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }
    initScrollReveal();

    // --- 9. Compteurs Chiffrés Animés (Hero & Statistiques de Confiance) ---
    function initAnimatedCounters() {
        const counters = document.querySelectorAll('.stat-num[data-target]');
        if (!counters.length) return;

        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseFloat(el.getAttribute('data-target'));
                    const prefix = el.getAttribute('data-prefix') || '';
                    const suffix = el.getAttribute('data-suffix') || '';
                    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
                    const duration = 1600; // ms
                    const startTime = performance.now();

                    function updateNumber(now) {
                        const elapsed = now - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        // Easing exponentiel doux et humain (easeOutExpo)
                        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                        const currentVal = target * ease;

                        el.textContent = `${prefix}${currentVal.toFixed(decimals)}${suffix}`;

                        if (progress < 1) {
                            requestAnimationFrame(updateNumber);
                        } else {
                            el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
                        }
                    }

                    requestAnimationFrame(updateNumber);
                    observer.unobserve(el);
                }
            });
        }, {
            threshold: 0.25
        });

        counters.forEach(counter => counterObserver.observe(counter));
    }
    initAnimatedCounters();

    // --- 10. Effet Tactile 3D Doux sur la Carte de Livraison Hero (Survol Souris) ---
    function initHeroTilt() {
        const heroVisual = document.querySelector('.hero-visual');
        const deliveryCard = document.querySelector('.delivery-card');

        if (!heroVisual || !deliveryCard) return;
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        let animationFrameId = null;

        heroVisual.addEventListener('mousemove', (e) => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);

            animationFrameId = requestAnimationFrame(() => {
                const rect = deliveryCard.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const mouseX = e.clientX - centerX;
                const mouseY = e.clientY - centerY;

                // Angle doux limité à ~5 degrés
                const rotateX = -(mouseY / (rect.height / 2)) * 5;
                const rotateY = (mouseX / (rect.width / 2)) * 5;

                deliveryCard.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
            });
        });

        heroVisual.addEventListener('mouseleave', () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            deliveryCard.style.transform = '';
        });
    }
    initHeroTilt();
});
