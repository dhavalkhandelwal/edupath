const authModal = document.getElementById('auth-modal');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const closeBtn = document.querySelector('.close');
const loginTab = document.getElementById('login-tab');
const signupTab = document.getElementById('signup-tab');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const userProfile = document.getElementById('user-profile');
const usernameDisplay = document.getElementById('username-display');
const logoutBtn = document.getElementById('logout-btn');
const loginError = document.getElementById('login-error');
const signupError = document.getElementById('signup-error');
const learningCartBtn = document.getElementById('learning-cart-btn');
const learningCartModal = document.getElementById('learning-cart-modal');
const learningCartItems = document.getElementById('learning-cart-items');
const learningCartTotal = document.getElementById('learning-cart-total');
const learningCartCount = document.getElementById('learning-cart-count');
const emptyLearningCart = document.getElementById('empty-learning-cart');
const closeLearningCartBtn = document.querySelector('.close-learning-cart');
const enrollBtn = document.getElementById('enroll-btn');
const myLearningPathBtn = document.getElementById('my-learning-path-btn');
const myLearningPathModal = document.getElementById('my-learning-path-modal');
const enrolledCourses = document.getElementById('enrolled-courses');
const noEnrolledCourses = document.getElementById('no-enrolled-courses');
const closeMyLearningPathBtn = document.querySelector('.close-my-learning-path');
const priceFilter = document.getElementById('price-filter');
const durationFilter = document.getElementById('duration-filter');
const difficultyFilter = document.getElementById('difficulty-filter');
const searchInput = document.getElementById('search-input');
const coursesGrid = document.getElementById('courses-grid');
const loadingIndicator = document.getElementById('loading');
const noResults = document.getElementById('no-results');

let currentUser = null;

function initializeUsers() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    return JSON.parse(localStorage.getItem('users'));
}

function initializeLearningCart() {
    if (!localStorage.getItem('learningCart')) {
        localStorage.setItem('learningCart', JSON.stringify([]));
    }
    return JSON.parse(localStorage.getItem('learningCart'));
}

const users = initializeUsers();
let learningCart = initializeLearningCart();

function checkLoggedInUser() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showLoggedInState();
        updateLearningCartCount();
    }
}

function showLoggedInState() {
    loginBtn.classList.add('hidden');
    signupBtn.classList.add('hidden');
    userProfile.classList.remove('hidden');
    usernameDisplay.textContent = currentUser.username;
    
    learningCartBtn.style.display = 'inline-block';
    myLearningPathBtn.style.display = 'inline-block';
}

function showLoggedOutState() {
    loginBtn.classList.remove('hidden');
    signupBtn.classList.remove('hidden');
    userProfile.classList.add('hidden');
    usernameDisplay.textContent = '';
    
   learningCartBtn.style.display = 'none';
    myLearningPathBtn.style.display = 'none';
}

loginBtn.addEventListener('click', () => {
    authModal.classList.remove('hidden');
    showLoginTab();
});

signupBtn.addEventListener('click', () => {
    authModal.classList.remove('hidden');
    showSignupTab();
});

closeBtn.addEventListener('click', () => {
    authModal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target === authModal) {
        authModal.classList.add('hidden');
    }
    if (e.target === learningCartModal) {
        learningCartModal.classList.add('hidden');
    }
    if (e.target === myLearningPathModal) {
        myLearningPathModal.classList.add('hidden');
    }
});

loginTab.addEventListener('click', showLoginTab);
signupTab.addEventListener('click', showSignupTab);

function showLoginTab() {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
}

function showSignupTab() {
    loginTab.classList.remove('active');
    signupTab.classList.add('active');
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const currentUsers = JSON.parse(localStorage.getItem('users'));
    const user = currentUsers.find(user => user.email === email && user.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
       if (user.learningCartItems && user.learningCartItems.length > 0) {
            learningCart = user.learningCartItems;
            localStorage.setItem('learningCart', JSON.stringify(learningCart));
        }
        
        authModal.classList.add('hidden');
        showLoggedInState();
        loginError.textContent = '';
        updateLearningCartCount();
        loginForm.reset();
        
        displayCourses();
    } else {
        loginError.textContent = 'Invalid email or password';
    }
});

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
   if (!username || !email || !password) {
        signupError.textContent = 'All fields are required';
        return;
    }
    
    if (password.length < 6) {
        signupError.textContent = 'Password must be at least 6 characters';
        return;
    }
    
    const currentUsers = JSON.parse(localStorage.getItem('users'));
    
    if (currentUsers.some(user => user.email === email)) {
        signupError.textContent = 'Email already in use';
        return;
    }
    
    const newUser = { 
        username, 
        email, 
        password,
        enrolledCourses: [], 
        learningCartItems: [] 
    };
    
    currentUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(currentUsers));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    authModal.classList.add('hidden');
    showLoggedInState();
    signupError.textContent = '';
    signupForm.reset();
    
    showNotification(`Welcome to EduPath, ${username}! Start building your learning journey today.`);
});

logoutBtn.addEventListener('click', () => {
   if (currentUser) {
        const currentUsers = JSON.parse(localStorage.getItem('users'));
        const userIndex = currentUsers.findIndex(user => user.email === currentUser.email);
        
        if (userIndex !== -1) {
            currentUsers[userIndex].learningCartItems = learningCart;
            localStorage.setItem('users', JSON.stringify(currentUsers));
        }
    }
    
    localStorage.removeItem('currentUser');
    currentUser = null;
    learningCart = [];
    localStorage.setItem('learningCart', JSON.stringify(learningCart));
    updateLearningCartCount();
    showLoggedOutState();
    
    displayCourses();
});

const courses = [
    {
        id: 1,
        title: "Data Science with Python: Complete Masterclass",
        image: "https://www.sastrainingindelhi.com/wp-content/uploads/2021/05/data-science-training-gurgaon.jpg",
        price: 4999,
        duration: "12 weeks",
        difficulty: "intermediate",
        students: 4521,
        tags: ["Python", "Data Science", "Machine Learning"],
        rating: 4.7,
        instructor: "Dr. Rebecca Goddam",
        completionBadge: "Data Science Specialist"
    },
    {
        id: 2,
        title: "Full Stack Web Development Bootcamp",
        image: "https://skillupacademy.in/wp-content/uploads/2024/10/FSWD-scaled.jpg",
        price: 7499,
        duration: "16 weeks",
        difficulty: "beginner",
        students: 12345,
        tags: ["HTML/CSS", "JavaScript", "React"],
        rating: 4.8,
        instructor: "Dr. Kanu Patel",
        completionBadge: "Full Stack Developer"
    },
    {
        id: 3,
        title: "Digital Marketing Fundamentals",
        image: "https://courses.iid.org.in/public//uploads/media_manager/628.jpg",
        price: 2999,
        duration: "6 weeks",
        difficulty: "beginner",
        students: 8742,
        tags: ["SEO", "Social Media", "Analytics"],
        rating: 4.5,
        instructor: "Priya Patel",
        completionBadge: "Digital Marketing Associate"
    },
    {
        id: 4,
        title: "Artificial Intelligence & Deep Learning",
        image: "https://5.imimg.com/data5/SELLER/Default/2021/9/XM/YT/PK/83343488/artificial-intelligence-and-machine-learning-training.jpeg",
        price: 8999,
        duration: "14 weeks",
        difficulty: "advanced",
        students: 3187,
        tags: ["AI", "Neural Networks", "TensorFlow"],
        rating: 4.9,
        instructor: "Prof. Sanjay Patel",
        completionBadge: "AI Engineer"
    },
    {
        id: 5,
        title: "Flutter App Development for Beginners",
        image: "https://miro.medium.com/v2/resize:fit:1400/0*LpYMQ2UKZOvUB-JO",
        price: 3499,
        duration: "8 weeks",
        difficulty: "beginner",
        students: 5826,
        tags: ["Flutter", "Dart", "Mobile Dev"],
        rating: 4.6,
        instructor: "Neha Gupta",
        completionBadge: "Mobile Developer"
    },
    {
        id: 6,
        title: "Financial Analysis & Investment Management",
        image: "https://img-c.udemycdn.com/course/750x422/1802334_300e_5.jpg",
        price: 5499,
        duration: "10 weeks",
        difficulty: "intermediate",
        students: 4239,
        tags: ["Finance", "Investment", "Excel"],
        rating: 4.7,
        instructor: "Vikram Mehta",
        completionBadge: "Financial Analyst"
    },
    {
        id: 7,
        title: "UI/UX Design: From Beginner to Professional",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSs0AXTawqHxElSmcCRk2moR2pKAqCf7psLCg&s",
        price: 4299,
        duration: "12 weeks",
        difficulty: "beginner",
        students: 7651,
        tags: ["Figma", "UX Research", "Design"],
        rating: 4.8,
        instructor: "Jay Padhiyar",
        completionBadge: "UX Designer"
    },
    {
        id: 8,
        title: "Complete DevOps Engineering Certification",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCbeDUlv-uTYlFwpN3QiprKYbFMYhKl-l2OQ&s",
        price: 9999,
        duration: "16 weeks",
        difficulty: "advanced",
        students: 2845,
        tags: ["Docker", "Kubernetes", "CI/CD"],
        rating: 4.9,
        instructor: "Arjun Reddy",
        completionBadge: "DevOps Engineer"
    }
];

function filterCourses() {
    const priceValue = priceFilter.value;
    const durationValue = durationFilter.value;
    const difficultyValue = difficultyFilter.value;
    const searchValue = searchInput.value.toLowerCase().trim();
    
    return courses.filter(course => {
        if (priceValue === 'free' && course.price > 0) return false;
        if (priceValue === 'paid' && course.price === 0) return false;
        if (priceValue === '0-1999' && (course.price > 1999 || course.price === 0)) return false;
        if (priceValue === '2000-4999' && (course.price < 2000 || course.price > 4999)) return false;
        if (priceValue === '5000+' && course.price < 5000) return false;
        
        const weeks = parseInt(course.duration);
        if (durationValue === 'short' && weeks > 4) return false;
        if (durationValue === 'medium' && (weeks < 4 || weeks > 12)) return false;
        if (durationValue === 'long' && weeks < 12) return false;
        
        if (difficultyValue !== 'all' && course.difficulty !== difficultyValue) return false;
        
        if (searchValue) {
            const titleMatch = course.title.toLowerCase().includes(searchValue);
            const tagsMatch = course.tags.some(tag => tag.toLowerCase().includes(searchValue));
            const instructorMatch = course.instructor.toLowerCase().includes(searchValue);
            return titleMatch || tagsMatch || instructorMatch;
        }
        
        return true;
    });
}

function displayCourses() {
    loadingIndicator.classList.remove('hidden');
    coursesGrid.innerHTML = '';
    noResults.classList.add('hidden');
    
    setTimeout(() => {
        const filteredCourses = filterCourses();
        
        if (filteredCourses.length === 0) {
            noResults.classList.remove('hidden');
        } else {
            filteredCourses.forEach(course => {
                coursesGrid.appendChild(createCourseCard(course));
            });
        }
        
        loadingIndicator.classList.add('hidden');
    }, 500);
}

function createCourseCard(course) {
    const card = document.createElement('div');
    card.className = 'course-card';
    
    const formatPrice = (price) => {
        return price === 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`;
    };
    
    const tagsHTML = course.tags.map(tag => `<span class="course-tag">${tag}</span>`).join('');
    
    const isEnrolled = currentUser && currentUser.enrolledCourses && 
                       currentUser.enrolledCourses.some(c => c.id === course.id);
    
    const isInLearningCart = learningCart.some(item => item.id === course.id);
    
    let actionButton;
    if (isEnrolled) {
        actionButton = `<button class="btn btn-secondary" disabled>Enrolled</button>`;
    } else if (isInLearningCart) {
        actionButton = `<button class="btn btn-secondary remove-from-learning-cart" data-id="${course.id}">Remove from Learning Path</button>`;
    } else {
        actionButton = `<button class="btn btn-primary add-to-learning-cart" data-id="${course.id}">Add to Learning Path</button>`;
    }
    
    card.innerHTML = `
        <div class="course-card-header">
            <img src="${course.image}" alt="${course.title}" class="course-image">
            <div class="course-rating">
                <span class="rating-stars">${'★'.repeat(Math.floor(course.rating))}${'☆'.repeat(5-Math.floor(course.rating))}</span>
                <span class="rating-value">${course.rating}</span>
            </div>
        </div>
        <div class="course-info">
            <h3 class="course-title">${course.title}</h3>
            <div class="course-instructor">By ${course.instructor}</div>
            <span class="course-difficulty difficulty-${course.difficulty}">${course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}</span>
            <div class="course-meta">
                <div class="meta-item">
                    <i class="fas fa-clock"></i>
                    <span>${course.duration}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-user-graduate"></i>
                    <span>${course.students.toLocaleString()} learners</span>
                </div>
            </div>
            <div class="course-tags">
                ${tagsHTML}
            </div>
            <div class="course-price-action">
                <div class="course-price">${formatPrice(course.price)}</div>
                <div class="course-action">
                    ${actionButton}
                </div>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        const addToLearningCartBtn = card.querySelector('.add-to-learning-cart');
        if (addToLearningCartBtn) {
            addToLearningCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                addToLearningCart(course);
            });
        }
        
        const removeFromLearningCartBtn = card.querySelector('.remove-from-learning-cart');
        if (removeFromLearningCartBtn) {
            removeFromLearningCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                removeFromLearningCart(course.id);
            });
        }
    }, 0);
    
    return card;
}

function addToLearningCart(course) {
    if (!currentUser) {
        authModal.classList.remove('hidden');
        showLoginTab();
        return;
    }
    
    if (!learningCart.some(item => item.id === course.id)) {
        learningCart.push(course);
        localStorage.setItem('learningCart', JSON.stringify(learningCart));
        
        updateLearningCartCount();
        updateCourseCardButton(course.id, 'add');
        
        showNotification(`${course.title} added to your learning path`);
    }
}

function removeFromLearningCart(courseId) {
    learningCart = learningCart.filter(item => item.id !== courseId);
    localStorage.setItem('learningCart', JSON.stringify(learningCart));
    
    updateLearningCartCount();
    updateCourseCardButton(courseId, 'remove');
    
    if (!learningCartModal.classList.contains('hidden')) {
        displayLearningCartItems();
    }
    
    const course = courses.find(c => c.id === courseId);
    if (course) {
        showNotification(`${course.title} removed from your learning path`);
    }
}

function updateCourseCardButton(courseId, action) {
    const courseCards = document.querySelectorAll('.course-card');
    let courseCard = null;
    
    courseCards.forEach(card => {
        const button = card.querySelector(`.course-action button[data-id="${courseId}"]`);
        if (button) {
            courseCard = card;
        }
    });
    
    if (!courseCard) return;
    
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    const courseActionDiv = courseCard.querySelector('.course-action');
    
    if (action === 'add') {
        courseActionDiv.innerHTML = `
            <button class="btn btn-secondary remove-from-learning-cart" data-id="${courseId}">Remove from Learning Path</button>
        `;
        
        const newBtn = courseActionDiv.querySelector('.remove-from-learning-cart');
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            removeFromLearningCart(courseId);
        });
    } else if (action === 'remove') {
        courseActionDiv.innerHTML = `
            <button class="btn btn-primary add-to-learning-cart" data-id="${courseId}">Add to Learning Path</button>
        `;
        
        const newBtn = courseActionDiv.querySelector('.add-to-learning-cart');
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addToLearningCart(course);
        });
    } else if (action === 'purchase') {
        courseActionDiv.innerHTML = `
            <button class="btn btn-secondary" disabled>Enrolled</button>
        `;
    }
}

function updateLearningCartCount() {
    learningCartCount.textContent = learningCart.length;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

learningCartBtn.addEventListener('click', () => {
    if (!currentUser) {
        authModal.classList.remove('hidden');
        showLoginTab();
        return;
    }
    
    learningCartModal.classList.remove('hidden');
    displayLearningCartItems();
});

closeLearningCartBtn.addEventListener('click', () => {
    learningCartModal.classList.add('hidden');
});

function displayLearningCartItems() {
    learningCartItems.innerHTML = '';
    
    if (learningCart.length === 0) {
        emptyLearningCart.classList.remove('hidden');
        document.getElementById('learning-cart-summary').classList.add('hidden');
        return;
    }
    
    emptyLearningCart.classList.add('hidden');
    document.getElementById('learning-cart-summary').classList.remove('hidden');
    
    let total = 0;
    
    learningCart.forEach(item => {
        const learningCartItem = document.createElement('div');
        learningCartItem.className = 'learning-cart-item';
        
        learningCartItem.innerHTML = `
            <div class="learning-cart-item-info">
                <h4>${item.title}</h4>
                <div class="learning-cart-item-meta">
                    <span>${item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}</span>
                    <span>${item.duration}</span>
                </div>
                <div class="learning-cart-item-instructor">By ${item.instructor}</div>
            </div>
            <div class="learning-cart-item-price">₹${item.price.toLocaleString('en-IN')}</div>
            <button class="remove-btn" data-id="${item.id}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        learningCartItems.appendChild(learningCartItem);
        total += item.price;
        
        const removeBtn = learningCartItem.querySelector('.remove-btn');
        removeBtn.addEventListener('click', () => {
            removeFromLearningCart(item.id);
        });
    });
    
    learningCartTotal.textContent = `Total: ₹${total.toLocaleString('en-IN')}`;
}

myLearningPathBtn.addEventListener('click', () => {
    if (!currentUser) {
        authModal.classList.remove('hidden');
        showLoginTab();
        return;
    }
    
    myLearningPathModal.classList.remove('hidden');
    displayEnrolledCourses();
});

closeMyLearningPathBtn.addEventListener('click', () => {
    myLearningPathModal.classList.add('hidden');
});

function displayEnrolledCourses() {
    enrolledCourses.innerHTML = '';
    
    if (!currentUser || !currentUser.enrolledCourses || currentUser.enrolledCourses.length === 0) {
        noEnrolledCourses.classList.remove('hidden');
        return;
    }
    
    noEnrolledCourses.classList.add('hidden');
    
    currentUser.enrolledCourses.forEach(course => {
        const courseItem = document.createElement('div');
        courseItem.className = 'enrolled-course';
        
        courseItem.innerHTML = `
            <img src="${course.image}" alt="${course.title}" class="enrolled-course-image">
            <div class="enrolled-course-info">
                <h4>${course.title}</h4>
                <div class="enrolled-course-meta">
                    <span>${course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}</span>
                    <span>${course.duration}</span>
                    <span class="completion-badge">${course.completionBadge}</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar" style="width: 0%"></div>
                    <span class="progress-text">0% Complete</span>
                </div>
                <button class="btn btn-primary continue-learning-btn">Continue Learning</button>
            </div>
        `;
        
        enrolledCourses.appendChild(courseItem);
    });
}

enrollBtn.addEventListener('click', () => {
    if (learningCart.length === 0) return;
    
    if (currentUser) {
        if (!currentUser.enrolledCourses) {
            currentUser.enrolledCourses = [];
        }
        
       learningCart.forEach(item => {
           if (!currentUser.enrolledCourses.some(course => course.id === item.id)) {
                currentUser.enrolledCourses.push(item);
            }
        });
        
        const currentUsers = JSON.parse(localStorage.getItem('users'));
        const userIndex = currentUsers.findIndex(user => user.email === currentUser.email);
        
        if (userIndex !== -1) {
            currentUsers[userIndex].enrolledCourses = currentUser.enrolledCourses;
            localStorage.setItem('users', JSON.stringify(currentUsers));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
       learningCart = [];
        localStorage.setItem('learningCart', JSON.stringify(learningCart));
        
        updateLearningCartCount();
        
        learningCartModal.classList.add('hidden');
        
        showNotification('Enrollment successful! You can now access these courses in your learning path.');
        
        displayCourses();
    }
});


priceFilter.addEventListener('change', displayCourses);
durationFilter.addEventListener('change', displayCourses);
difficultyFilter.addEventListener('change', displayCourses);
searchInput.addEventListener('input', displayCourses);

window.addEventListener('DOMContentLoaded', () => {
 learningCartBtn.style.display = 'none';
    myLearningPathBtn.style.display = 'none';
    
   checkLoggedInUser();
    
   displayCourses();
});