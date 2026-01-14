// Booking functionality
function showBookingOptions(serviceType) {
            const modal = document.createElement('div');
            modal.className = 'booking-modal-overlay';
            modal.innerHTML = `
                <div class="booking-modal">
                    <div class="booking-modal-header">
                        <h3>Choose Your Booking Method</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="booking-modal-content">
                        <div class="booking-option" onclick="openWhatsAppBooking('${serviceType}')">
                            <div class="booking-icon">📱</div>
                            <h4>Book via WhatsApp</h4>
                            <p>Quick and easy booking through WhatsApp</p>
                            <button class="booking-btn">Continue with WhatsApp</button>
                        </div>
                        <div class="booking-option" onclick="redirectToWebApp('${serviceType}')">
                            <div class="booking-icon">💻</div>
                            <h4>Book via Web App</h4>
                            <p>Complete booking with detailed options and payment</p>
                            <button class="booking-btn primary">Continue with Web App</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Close modal handlers
            modal.querySelector('.close-modal').onclick = () => modal.remove();
            modal.onclick = (e) => {
                if (e.target === modal) modal.remove();
            };
        }

function redirectToWebApp(serviceType) {
            // Check if user is logged in
            const token = localStorage.getItem('authToken');
            if (!token) {
                localStorage.setItem('pendingService', serviceType);
                window.location.href = '/login?redirect=booking';
                return;
            }
            
            // Redirect to booking page with service type
            window.location.href = `/booking?service=${encodeURIComponent(serviceType)}`;
        }

// Update existing booking buttons to use new modal  
function updateBookingButtons() {
            const bookingButtons = document.querySelectorAll('.service-book-btn, .book-btn');
            bookingButtons.forEach(button => {
                const originalOnClick = button.getAttribute('onclick');
                if (originalOnClick && originalOnClick.includes('openWhatsAppBooking')) {
                    const serviceMatch = originalOnClick.match(/openWhatsAppBooking\('(.+?)'\)/);
                    if (serviceMatch) {
                        const serviceType = serviceMatch[1];
                        button.setAttribute('onclick', `showBookingOptions('${serviceType}')`);
                    }
                }
            });
        }

        // 3D Background Animation
        function init3DBackground() {
            const canvas = document.getElementById('canvas-3d');
            const ctx = canvas.getContext('2d');
            
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            const particles = [];
            const particleCount = 50;
            
            class Particle {
                constructor() {
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                    this.z = Math.random() * 1000;
                    this.size = Math.random() * 2 + 1;
                    this.speedX = (Math.random() - 0.5) * 0.5;
                    this.speedY = (Math.random() - 0.5) * 0.5;
                    this.speedZ = Math.random() * 1 - 0.5;
                    this.color = `rgba(26, 78, 255, ${Math.random() * 0.5 + 0.1})`;
                }
                
                update() {
                    this.x += this.speedX;
                    this.y += this.speedY;
                    this.z += this.speedZ;
                    
                    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
                    if (this.z < 0 || this.z > 1000) this.speedZ *= -1;
                }
                
                draw() {
                    const perspective = 1000 / (1000 + this.z);
                    const x = this.x * perspective + (canvas.width * (1 - perspective)) / 2;
                    const y = this.y * perspective + (canvas.height * (1 - perspective)) / 2;
                    const size = this.size * perspective;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fillStyle = this.color;
                    ctx.fill();
                }
            }
            
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
            
            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                particles.forEach(particle => {
                    particle.update();
                    particle.draw();
                });
                
                // Draw connections
                particles.forEach((p1, i) => {
                    particles.slice(i + 1).forEach(p2 => {
                        const dx = p1.x - p2.x;
                        const dy = p1.y - p2.y;
                        const dz = p1.z - p2.z;
                        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                        
                        if (distance < 200) {
                            const opacity = (1 - distance / 200) * 0.2;
                            ctx.strokeStyle = `rgba(26, 78, 255, ${opacity})`;
                            ctx.lineWidth = 1;
                            ctx.beginPath();
                            ctx.moveTo(p1.x, p1.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.stroke();
                        }
                    });
                });
                
                requestAnimationFrame(animate);
            }
            
            animate();
            
            window.addEventListener('resize', () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            });
        }

        // Initialize 3D background
        init3DBackground();

        // SIMPLE WHATSAPP-STYLE CHATBOT DATA
            const chatFlows = {
            welcome: {
                message: "Hi! 👋 Welcome to Woostaa! I'm here to help you with professional home services in Bangalore.",
                options: [
                    { text: "🏠 Our Services", next: "services" },
                    { text: "💰 Pricing Info", next: "pricing" },
                    { text: "📱 Book Now", next: "booking" },
                    { text: "❓ Help & Support", next: "support" }
                ]
            },
            services: {
                message: "We offer these professional home services:",
                services: [
                    { emoji: "🏠", name: "Maid Services", price: "starts ₹249/hour onwards", action: "book_maid" },
                    { emoji: "👨‍🍳", name: "Cook Services", price: "starts ₹299/hour onwards", action: "book_cook" },
                    { emoji: "🚗", name: "Driver Services", price: "starts ₹499 onwards", action: "book_driver" },
                    { emoji: "🚿", name: "Car Washing", price: "starts ₹249/wash onwards", action: "book_car" },
                    { emoji: "🧽", name: "Deep Cleaning", price: "starts ₹699/session onwards", action: "book_deep" },
                    { emoji: "🐛", name: "Pest Control", price: "starts ₹699/treatment onwards", action: "book_pest" }
                ],
                options: [
                    { text: "💰 View Pricing", next: "pricing" },
                    { text: "📱 Book Service", next: "booking" },
                    { text: "🔙 Back to Menu", next: "welcome" }
                ]
            },
            pricing: {
                message: "Our transparent pricing (no hidden costs):",
                pricing: [
                    "🏠 Maid Services: starts  ₹249/hour onwards",
                    "👨‍🍳 Cook Services: starts ₹299/hour onwards", 
                    "🚗 Driver Services: starts ₹399/trip onwards",
                    "🚿 Car Washing:starts ₹249/wash onwards",
                    "🧽 Deep Cleaning:starts ₹699 (depends on site)",
                    "🐛 Pest Control:starts ₹699 (depends on site)"
                ],
                note: "Final price depends on service duration and requirements. All services include verified professionals with quality guarantee.",
                options: [
                    { text: "📱 Book Now", next: "booking" },
                    { text: "🏠 View Services", next: "services" },
                    { text: "🔙 Back to Menu", next: "welcome" }
                ]
            },
            booking: {
                message: "Ready to book? Choose your preferred method:",
                options: [
                    { text: "📱 WhatsApp Booking", action: "whatsapp" },
                    { text: "📞 Call Us Now", action: "call" },
                    { text: "💬 Continue Chat", next: "support" },
                    { text: "🔙 Back to Menu", next: "welcome" }
                ]
            },
            support: {
                message: "How can I help you today?",
                options: [
                    { text: "📋 Service Details", next: "services" },
                    { text: "💰 Pricing Info", next: "pricing" },
                    { text: "📱 Book Service", next: "booking" },
                    { text: "ℹ️ About Woostaa", next: "about" },
                    { text: "📞 Contact Support", action: "whatsapp" }
                ]
            },
            about: {
                message: "Founded by Abdul Waris (CEO) & Aryan Raj (CFO), Woostaa connects you with verified professionals for home services in Bangalore. We ensure quality, speed & reliability.",
                features: [
                    "✅ 100% Verified Professionals",
                    "🎯 Quality Guaranteed", 
                    "⚡ Fast & Reliable Service",
                    "💰 Transparent Pricing",
                    "📱 Easy Booking Process",
                    "🕐 24/7 Customer Support"
                ],
                options: [
                    { text: "📱 Book Service", next: "booking" },
                    { text: "🏠 Our Services", next: "services" },
                    { text: "🔙 Back to Menu", next: "welcome" }
                ]
            }
        };

        let currentChatState = 'welcome';
        let isTyping = false;

        // Update iPhone time display
        function updateiPhoneTime() {
            const timeElement = document.getElementById('iphone-time');
            if (timeElement) {
                const now = new Date();
                const hours = now.getHours();
                const minutes = now.getMinutes().toString().padStart(2, '0');
                const formattedTime = `${hours}:${minutes}`;
                timeElement.textContent = formattedTime;
            }
        }

        // Update time immediately and then every minute
        updateiPhoneTime();
        setInterval(updateiPhoneTime, 60000);

        // Enhanced Loading Animation
        window.addEventListener('load', () => {
            setTimeout(() => {
                const loader = document.getElementById('loader');
                loader.style.opacity = '0';
                loader.style.transform = 'scale(0.8) perspective(1000px) rotateX(90deg)';
                setTimeout(() => {
                    loader.style.display = 'none';
                    document.body.style.overflow = 'visible';
                }, 600);
            }, 1500);
        });

        // Enhanced Header Scroll Effect with 3D
        window.addEventListener('scroll', () => {
            const header = document.getElementById('header');
            const currentScroll = window.pageYOffset;

            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            // Parallax effect for hero content
            const heroContent = document.querySelector('.hero-content');
            if (heroContent && currentScroll < window.innerHeight) {
                const parallaxSpeed = 0.5;
                heroContent.style.transform = `translateY(${currentScroll * parallaxSpeed}px) translateZ(50px)`;
            }

            // 3D rotation for floating shapes
            const shapes = document.querySelectorAll('.shape-3d');
            shapes.forEach((shape, index) => {
                const speed = (index + 1) * 0.5;
                shape.style.transform = `rotate(${currentScroll * speed * 0.1}deg)`;
            });
        });

        // Enhanced Smooth Scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerHeight = document.getElementById('header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Enhanced Counter Animation with 3D effect
        const counters = document.querySelectorAll('.counter');
        const counterSection = document.querySelector('.progress-section');
        let counterStarted = false;

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !counterStarted) {
                    counterStarted = true;
                    startCounters();
                    // Add 3D tilt to progress stats
                    const stats = document.querySelectorAll('.progress-stat');
                    stats.forEach((stat, index) => {
                        setTimeout(() => {
                            stat.style.transform = 'translateY(-10px) rotateX(10deg)';
                        }, index * 100);
                    });
                }
            });
        }, { threshold: 0.5 });

        if (counterSection) {
            counterObserver.observe(counterSection);
        }

        function startCounters() {
            counters.forEach(counter => {
                const target = +counter.getAttribute('data-target');
                const increment = target / 100;
                let current = 0;

                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        counter.textContent = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        if(current < 100){
                            counter.textContent = target.toLocaleString()
                        }
                        else{
                            counter.textContent = target.toLocaleString() + "+";
                        }
                    }
                };
                updateCounter();
            });
        }

        // IMPROVED Steps Slider with Clickable Steps
        let currentStepIndex = 0;
        const totalSteps = 3;
        const stepsTrack = document.getElementById('stepsTrack');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const currentStepSpan = document.getElementById('currentStep');
        const stepDots = document.querySelectorAll('.step-dot');
        const steps = document.querySelectorAll('.step');

        // Check if on mobile
        let isMobile = window.innerWidth <= 768;

        function updateStepDisplay() {
            if (!stepsTrack) return;
            
            const steps = document.querySelectorAll('.step');
            
            if (isMobile) {
                // Mobile: show all steps
                steps.forEach((step, index) => {
                    step.classList.toggle('active', index === currentStepIndex);
                });
            } else {
                // Desktop: center active step
                const stepWidth = 400; // max-width of step
                const gap = 32; // 2rem gap
                const containerWidth = stepsTrack.offsetWidth;
                const offset = (containerWidth - stepWidth) / 2;
                const translateX = offset - (currentStepIndex * (stepWidth + gap));
                
                stepsTrack.style.transform = `translateX(${translateX}px)`;
                
                steps.forEach((step, index) => {
                    step.classList.toggle('active', index === currentStepIndex);
                });
            }
            
            if (prevBtn) prevBtn.disabled = currentStepIndex === 0;
            if (nextBtn) nextBtn.disabled = currentStepIndex === totalSteps - 1;
            
            if (currentStepSpan) currentStepSpan.textContent = currentStepIndex + 1;
            
            stepDots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentStepIndex);
            });
        }

        // Make steps clickable
        steps.forEach((step, index) => {
            step.addEventListener('click', () => {
                currentStepIndex = index;
                updateStepDisplay();
            });
        });

        if (!isMobile && prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentStepIndex > 0) {
                    currentStepIndex--;
                    updateStepDisplay();
                }
            });
        }

        if (!isMobile && nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentStepIndex < totalSteps - 1) {
                    currentStepIndex++;
                    updateStepDisplay();
                }
            });
        }

        stepDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentStepIndex = index;
                updateStepDisplay();
            });
        });

        // REMOVED AUTO-ADVANCE FOR STEPS

        // ENHANCED TESTIMONIALS FUNCTIONALITY - REMOVED AUTO-SCROLL
        let currentTestimonialIndex = 2; // Start with the middle testimonial
        const totalTestimonials = 5;
        const testimonialsTrack = document.getElementById('testimonialsTrack');
        const prevTestimonialBtn = document.getElementById('prevTestimonial');
        const nextTestimonialBtn = document.getElementById('nextTestimonial');
        const testimonialDots = document.querySelectorAll('.testimonial-dot');
        const testimonials = document.querySelectorAll('.testimonial');
        let touchStartX = 0;
        let touchEndX = 0;

        function updateTestimonialDisplay(animate = true) {
            if (!testimonialsTrack) return;

            // Calculate position for centering active testimonial
            const testimonialWidth = 350; // testimonial width
            const gap = 32; // 2rem gap
            const containerWidth = document.querySelector('.testimonials-wrapper').offsetWidth;
            const totalTrackWidth = (testimonialWidth + gap) * totalTestimonials - gap;
            
            // Calculate offset to center the active testimonial
            const centerOffset = (containerWidth - testimonialWidth) / 2;
            const translateX = centerOffset - (currentTestimonialIndex * (testimonialWidth + gap));

            if (animate) {
                testimonialsTrack.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            } else {
                testimonialsTrack.style.transition = 'none';
            }
            
            testimonialsTrack.style.transform = `translateX(${translateX}px)`;

            // Update testimonial states
            testimonials.forEach((testimonial, index) => {
                if (index === currentTestimonialIndex) {
                    testimonial.classList.add('active');
                } else {
                    testimonial.classList.remove('active');
                }
            });

            // Update dots
            testimonialDots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentTestimonialIndex);
            });

            // Update navigation buttons
            if (prevTestimonialBtn) {
                prevTestimonialBtn.disabled = currentTestimonialIndex === 0;
            }
            if (nextTestimonialBtn) {
                nextTestimonialBtn.disabled = currentTestimonialIndex === totalTestimonials - 1;
            }
        }

        function goToTestimonial(index, animate = true) {
            if (index >= 0 && index < totalTestimonials) {
                currentTestimonialIndex = index;
                updateTestimonialDisplay(animate);
            }
        }

        function nextTestimonial() {
            if (currentTestimonialIndex < totalTestimonials - 1) {
                goToTestimonial(currentTestimonialIndex + 1);
            }
        }

        function prevTestimonial() {
            if (currentTestimonialIndex > 0) {
                goToTestimonial(currentTestimonialIndex - 1);
            }
        }

        // Event listeners for testimonial navigation
        if (prevTestimonialBtn) {
            prevTestimonialBtn.addEventListener('click', () => {
                prevTestimonial();
            });
        }

        if (nextTestimonialBtn) {
            nextTestimonialBtn.addEventListener('click', () => {
                nextTestimonial();
            });
        }

        // Dot navigation
        testimonialDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToTestimonial(index);
            });
        });

        // Touch/Swipe support for testimonials
        const testimonialsWrapper = document.getElementById('testimonialsWrapper');
        if (testimonialsWrapper) {
            testimonialsWrapper.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            testimonialsWrapper.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, { passive: true });

            testimonialsWrapper.addEventListener('mousedown', (e) => {
                touchStartX = e.clientX;
                e.preventDefault();
            });

            testimonialsWrapper.addEventListener('mouseup', (e) => {
                touchEndX = e.clientX;
                handleSwipe();
            });
        }

        function handleSwipe() {
            const swipeThreshold = 50;
            const swipeDistance = touchStartX - touchEndX;

            if (Math.abs(swipeDistance) > swipeThreshold) {
                if (swipeDistance > 0) {
                    // Swipe left - next testimonial
                    nextTestimonial();
                } else {
                    // Swipe right - previous testimonial
                    prevTestimonial();
                }
            }
        }

        // Initialize testimonials
        function initTestimonials() {
            updateTestimonialDisplay(false);
        }

        // FAQ Accordion with 3D effect
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const item = question.parentElement;
                const wasActive = item.classList.contains('active');
                
                document.querySelectorAll('.faq-item').forEach(faqItem => {
                    faqItem.classList.remove('active');
                    faqItem.style.transform = 'rotateX(0deg)';
                });
                
                if (!wasActive) {
                    item.classList.add('active');
                    item.style.transform = 'translateY(-5px) rotateX(2deg)';
                }
            });
        });

        // Add 3D tilt effect to all cards
        function add3DTilt(elements) {
            elements.forEach(element => {
                element.addEventListener('mousemove', (e) => {
                    const rect = element.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    const rotateX = (y - centerY) / 20;
                    const rotateY = (centerX - x) / 20;
                    
                    element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
                });
                
                element.addEventListener('mouseleave', () => {
                    element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
                });
            });
        }

        // Apply 3D tilt to various elements
        add3DTilt(document.querySelectorAll('.service-card'));
        add3DTilt(document.querySelectorAll('.feature'));
        add3DTilt(document.querySelectorAll('.progress-stat'));

// SIMPLE WHATSAPP-STYLE CHATBOT
function openChatbot() {
    // Hide notification badge
    const notification = document.getElementById('chatNotification');
    if (notification) {
        notification.style.display = 'none';
    }

    // Create chatbot modal
    const modal = document.createElement('div');
    modal.className = 'chatbot-modal';
    
    modal.innerHTML = `
        <div class="chatbot-container">
            <div class="chatbot-header">
                <button class="chatbot-back" onclick="closeChatbot(this)">←</button>
                <div class="chatbot-avatar">🤖</div>
                <div class="chatbot-info">
                    <div class="chatbot-title">Woostaa Assistant</div>
                    <div class="chatbot-status">
                        <span class="online-dot"></span>
                        Online now
                    </div>
                </div>
            </div>
            
            <div class="chatbot-messages" id="chatMessages">
                <!-- Messages will be populated here -->
            </div>
            
            <div class="chatbot-input">
                <input type="text" placeholder="Type a message..." id="chatInput">
                <button class="send-button" onclick="sendMessage()" id="sendBtn">
                    ➤
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize chat
    currentChatState = 'welcome';
    setTimeout(() => {
        showBotMessage(chatFlows[currentChatState]);
    }, 500);
    
    // Setup input handlers
    setupChatInput();
}

function closeChatbot(button) {
    const modal = button.closest('.chatbot-modal');
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.9) perspective(1000px) rotateY(-10deg)';
    setTimeout(() => {
        modal.remove();
    }, 300);
}

function setupChatInput() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !isTyping) {
            sendMessage();
        }
    });
    
    input.addEventListener('input', (e) => {
        sendBtn.disabled = e.target.value.trim() === '' || isTyping;
    });
}

function showBotMessage(flow) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;

    // Show typing
    showTyping();
    
    setTimeout(() => {
        hideTyping();
        
        // Add bot message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        
        messageDiv.innerHTML = `
            <div class="message-bubble">
                <div class="message-text">${flow.message}</div>
                <div class="message-time">${getCurrentTime()}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        
        // Add services if present
        if (flow.services) {
            setTimeout(() => {
                const servicesDiv = document.createElement('div');
                servicesDiv.className = 'message bot';
                
                let servicesHtml = '<div class="message-bubble">';
                flow.services.forEach(service => {
                    servicesHtml += `
                        <div class="service-option-simple" onclick="handleServiceBook('${service.action}', '${service.name}')">
                            <div class="service-emoji">${service.emoji}</div>
                            <div class="service-text">
                                <div class="service-name">${service.name}</div>
                                <div class="service-price">${service.price}</div>
                            </div>
                        </div>
                    `;
                });
                servicesHtml += '<div class="message-time">' + getCurrentTime() + '</div></div>';
                servicesDiv.innerHTML = servicesHtml;
                
                messagesContainer.appendChild(servicesDiv);
                scrollToBottom();
            }, 300);
        }

        // Add pricing if present
        if (flow.pricing) {
            setTimeout(() => {
                const pricingDiv = document.createElement('div');
                pricingDiv.className = 'message bot';
                
                let pricingHtml = '<div class="message-bubble">';
                flow.pricing.forEach(price => {
                    pricingHtml += `<div>${price}</div>`;
                });
                if (flow.note) {
                    pricingHtml += `<div style="margin-top: 0.8rem; font-style: italic; color: #666; font-size: 0.85rem;">${flow.note}</div>`;
                }
                pricingHtml += '<div class="message-time">' + getCurrentTime() + '</div></div>';
                pricingDiv.innerHTML = pricingHtml;
                
                messagesContainer.appendChild(pricingDiv);
                scrollToBottom();
            }, 500);
        }

        // Add features if present
        if (flow.features) {
            setTimeout(() => {
                const featuresDiv = document.createElement('div');
                featuresDiv.className = 'message bot';
                
                let featuresHtml = '<div class="message-bubble">';
                flow.features.forEach(feature => {
                    featuresHtml += `<div style="margin: 0.3rem 0;">${feature}</div>`;
                });
                featuresHtml += '<div class="message-time">' + getCurrentTime() + '</div></div>';
                featuresDiv.innerHTML = featuresHtml;
                
                messagesContainer.appendChild(featuresDiv);
                scrollToBottom();
            }, 700);
        }

        // Add quick replies
        setTimeout(() => {
            if (flow.options) {
                const optionsDiv = document.createElement('div');
                optionsDiv.className = 'message bot';
                
                let optionsHtml = '<div class="message-bubble"><div class="quick-replies">';
                flow.options.forEach(option => {
                    if (option.next) {
                        optionsHtml += `<button class="quick-reply" onclick="handleQuickReply('${option.next}', '${option.text}')">${option.text}</button>`;
                    } else if (option.action) {
                        optionsHtml += `<button class="quick-reply" onclick="handleAction('${option.action}', '${option.text}')">${option.text}</button>`;
                    }
                });
                optionsHtml += '</div><div class="message-time">' + getCurrentTime() + '</div></div>';
                optionsDiv.innerHTML = optionsHtml;
                
                messagesContainer.appendChild(optionsDiv);
                scrollToBottom();
            }
        }, 900);
        
        scrollToBottom();
    }, 1000);
}

function showUserMessage(text) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    
    messageDiv.innerHTML = `
        <div class="message-bubble">
            <div class="message-text">${text}</div>
            <div class="message-time">${getCurrentTime()}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function showTyping() {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
        <div class="typing-bubble">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    scrollToBottom();
    isTyping = true;
}

function hideTyping() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
    isTyping = false;
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message === '' || isTyping) return;
    
    showUserMessage(message);
    input.value = '';
    
    // Process message (simple keyword matching)
    setTimeout(() => {
        processUserMessage(message);
    }, 500);
}

function processUserMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('₹')) {
        currentChatState = 'pricing';
    } else if (lowerMessage.includes('book') || lowerMessage.includes('appointment')) {
        currentChatState = 'booking';
    } else if (lowerMessage.includes('service') || lowerMessage.includes('clean') || lowerMessage.includes('cook')) {
        currentChatState = 'services';
    } else if (lowerMessage.includes('about') || lowerMessage.includes('founder')) {
        currentChatState = 'about';
    } else {
        currentChatState = 'support';
    }
    
    showBotMessage(chatFlows[currentChatState]);
}

function handleQuickReply(nextState, text) {
    showUserMessage(text);
    currentChatState = nextState;
    
    setTimeout(() => {
        showBotMessage(chatFlows[currentChatState]);
    }, 500);
}

function handleAction(action, text) {
    showUserMessage(text);
    
    setTimeout(() => {
        if (action === 'whatsapp') {
            showBotMessage({
                message: "Perfect! I'll open WhatsApp for you. Our team will respond within minutes! 🚀",
                options: []
            });
            setTimeout(() => {
                openWhatsAppGeneral();
                closeChatbot(document.querySelector('.chatbot-back'));
            }, 1500);
        } else if (action === 'call') {
            showBotMessage({
                message: "You can call us at +91 6362414118. Our team is ready to help! 📞",
                options: [
                    { text: "📱 WhatsApp Instead", action: "whatsapp" },
                    { text: "🔙 Back to Menu", next: "welcome" }
                ]
            });
        }
    }, 500);
}

function handleServiceBook(action, serviceName) {
    showUserMessage(`Book ${serviceName}`);
    
    setTimeout(() => {
        showBotMessage({
            message: `Great choice! I'll help you book ${serviceName}. Let me connect you with our booking team via WhatsApp.`,
            options: [
                { text: "📱 Open WhatsApp", action: "whatsapp" },
                { text: "📞 Call Instead", action: "call" },
                { text: "🔙 Back to Services", next: "services" }
            ]
        });
    }, 500);
}

function getCurrentTime() {
    return new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }
}

// WhatsApp Integration Functions
function openWhatsAppBooking(service) {
    const phoneNumber = '916362414118';
    const message = `Hi! I'm interested in ${service} from Woostaa. Can you please help me with booking and pricing details?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    safeWhatsAppOpen(whatsappURL);
}

function openWhatsAppGeneral() {
    const phoneNumber = '916362414118';
    const message = `Hi! I'm interested in Woostaa's professional home services in Bangalore. Can you help me get started?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    safeWhatsAppOpen(whatsappURL);
}

function openEmail() {
    window.location.href = 'mailto:hello@woostaa.com?subject=Inquiry about Woostaa Services';
}

// Error handling for WhatsApp
function safeWhatsAppOpen(url) {
    try {
        const newWindow = window.open(url, '_blank');
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
            showWhatsAppFallback();
        }
    } catch (error) {
        console.error('Failed to open WhatsApp:', error);
        showWhatsAppFallback();
    }
}

function showWhatsAppFallback() {
    const phoneNumber = '+91 6362414118';
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        padding: 1rem;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 2rem;
            border-radius: 20px;
            text-align: center;
            max-width: 400px;
            transform: perspective(1000px) rotateX(5deg);
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        ">
            <h3 style="color: #1A4EFF; margin-bottom: 1rem;">Contact Us</h3>
            <p style="margin-bottom: 1.5rem;">WhatsApp couldn't open automatically. Please contact us at:</p>
            <p style="font-size: 1.2rem; font-weight: bold; color: #25D366; margin-bottom: 1.5rem;">${phoneNumber}</p>
            <button onclick="navigator.clipboard.writeText('${phoneNumber}').then(() => alert('Phone number copied!')); this.closest('div').parentElement.remove();" style="
                background: #25D366;
                color: white;
                padding: 0.8rem 1.5rem;
                border: none;
                border-radius: 20px;
                cursor: pointer;
                margin-right: 1rem;
            ">Copy Number</button>
            <button onclick="this.closest('div').parentElement.remove()" style="
                background: #ccc;
                color: #333;
                padding: 0.8rem 1.5rem;
                border: none;
                border-radius: 20px;
                cursor: pointer;
            ">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.remove();
    }, 10000);
}

// Show chatbot notification after 30 seconds
setTimeout(() => {
    const notification = document.getElementById('chatNotification');
    if (notification) {
        notification.style.display = 'flex';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 10000);
    }
}, 30000);

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    updateStepDisplay();
    initTestimonials();
    updateiPhoneTime(); // Update iPhone time immediately
    updateBookingButtons(); // Update booking buttons to use new modal
    
    // Add accessibility improvements
    document.querySelectorAll('button, a').forEach(element => {
        if (!element.getAttribute('aria-label') && !element.textContent.trim()) {
            element.setAttribute('aria-label', 'Interactive element');
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const newIsMobile = window.innerWidth <= 768;
        if (newIsMobile !== isMobile) {
            isMobile = newIsMobile;
            updateStepDisplay();
        }
    });
    
    console.log('🚀 Woostaa 3D Enhanced Website Loaded!');
});

// Expose functions to global scope for onclick handlers
window.showBookingOptions = showBookingOptions;
window.redirectToWebApp = redirectToWebApp;

// Memory cleanup
let timeInterval = setInterval(updateiPhoneTime, 60000);

window.addEventListener('beforeunload', () => {
    // Clear the time update interval
    clearInterval(timeInterval);
});
    