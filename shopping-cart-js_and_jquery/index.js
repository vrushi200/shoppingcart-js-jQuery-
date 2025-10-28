// Swiper Initialization
var swiper = new Swiper(".product-slider", {
  loop: true,
  spaceBetween: 20,
  autoplay: {
    delay: 7500,
    disableOnInteraction: false,
  },
  centeredSlides: true,
  breakpoints: {
    0: {
      slidesPerView: 1,
    },
    768: {
      slidesPerView: 2,
    },
    1020: {
      slidesPerView: 3,
    },
  },
});

var reviewSwiper = new Swiper(".review-slider", {
  loop: true,
  spaceBetween: 20,
  autoplay: {
    delay: 7500,
    disableOnInteraction: false,
  },
  centeredSlides: true,
  breakpoints: {
    0: {
      slidesPerView: 1,
    },
    768: {
      slidesPerView: 2,
    },
    1020: {
      slidesPerView: 3,
    },
  },
});

$(document).ready(function () {
  // Check if the user is logged in
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!loggedInUser) {
    // If the user is not logged in, disable the Order button
    $("#order_btn").css("cursor", "not-allowed");
    $("#order_btn").prop("disabled", true);
    $("#order_btn").hide();
    $("#login_btn").show();
  } else {
    // If the user is logged in, enable the Order button
    $("#order_btn").css("cursor", "pointer");
    $("#order_btn").prop("disabled", false);
    $("#order_btn").show();
    $("#login_btn").hide();
  }

  $("#cart").hide();
  $("#cart-icon").click(function () {
    $(".pcart").toggle();
    $("#cart").toggle();
    updateCartView(); // Update the cart view when the cart is shown
  });

  let cartItemCount = 0;
  let totalPrice = 0; // Store total price

  $(".order_btn").click(function () {
    cartItemCount++;
    const imgSrc = $(this).parents(".box").find("img").attr("src");
    const title = $(this).parents(".box").find("h3").text();
    const priceText = $(this)
      .parents(".box")
      .find(".price")
      .text()
      .replace(/[^0-9.-]+/g, "");
    const price = parseFloat(priceText);
    totalPrice += price; // Add item price to total price

    const cartItem = `
      <div class="main d-flex p-3 border border-left-0 border-right-0 border-top-0 justify-content-between">
        <div class="col-md-3">
            <img src="${imgSrc}" height="70px" width="70px" alt=""/>
        </div>
        <div class="col-md-3 d-flex flex-wrap align-content-center">
            <h6><strong>${title}</strong></h6>
        </div>
        <div class="col-md-3 d-flex flex-wrap align-content-center justify-content-between">
            <button type="button" class="btn btn-block btn-sm btn-outline-primary increase">+</button>
            <span class="mx-2 quantity">1</span>
            <button type="button" class="btn btn-block btn-sm btn-outline-primary decrease">-</button>
        </div>
        <div class="col-md-2 d-flex flex-wrap align-content-center">
            <h6 class="mt-2"><span class="cart_item_price"><strong>${price.toFixed(
              2
            )}</strong></span></h6>
        </div>
        <div class="col-md-1 d-flex flex-wrap align-content-center">
            <span class="close" style="cursor:pointer;font-size:25px;">&times;</span>
        </div>
      </div>
    `;

    $("#order").append(cartItem);
    updateCartCount();
    updateCartTotal();
    updateCartView(); // Update cart view to show either "empty cart" or cart details

    // Handle close button
    $(".close").click(function () {
      const itemPrice = parseFloat(
        $(this).closest(".main").find(".cart_item_price strong").text()
      );
      totalPrice -= itemPrice; // Subtract item price from total price
      $(this).parents(".main").remove();
      updateCartCount();
      updateCartTotal();
      updateCartView(); // Update cart view to show either "empty cart" or cart details
    });

    // Handle increase and decrease buttons
    $(".increase")
      .last()
      .click(function () {
        updateQuantityAndPrice($(this), 1);
      });

    $(".decrease")
      .last()
      .click(function () {
        updateQuantityAndPrice($(this), -1);
      });
  });

  // Update quantity and price in cart
  function updateQuantityAndPrice(button, change) {
    const quantityElem = button.siblings(".quantity");
    const currentQuantity = parseInt(quantityElem.text());
    const newQuantity = currentQuantity + change;

    if (newQuantity < 1) return;

    quantityElem.text(newQuantity);

    const priceText = button
      .closest(".main")
      .find(".cart_item_price")
      .text()
      .replace(/[^0-9.-]+/g, "");
    const price = parseFloat(priceText);
    const newTotalPrice = (price / currentQuantity) * newQuantity;
    button
      .closest(".main")
      .find(".cart_item_price strong")
      .text(newTotalPrice.toFixed(2));

    totalPrice += price * change; // Adjust total price based on quantity change
    updateCartTotal(); // Update the total price in the cart
  }

  // Update cart count
  function updateCartCount() {
    const count = $("#order").children().length;
    $("#cart_item_count").text(count);
  }

  // Dynamically create and update cart details (Total Price, Discount, SGST, CGST)
  function updateCartTotal() {
    // Clear any previous dynamic details
    $("#cart-details").empty();

    const discount = totalPrice * 0.1; // 10% discount
    const discountPrice = totalPrice - discount;
    const sgst = discountPrice * 0.09; // 9% SGST
    const cgst = discountPrice * 0.09; // 9% CGST
    const finalPrice = discountPrice + sgst + cgst;

    // Dynamically create cart total details
    const cartDetails = `
      <h3>Total Price: ₹<span id="cart-total-price">${finalPrice.toFixed(
        2
      )}</span></h3>
      <h5>Discount: ₹<span id="cart-discount">${discount.toFixed(2)}</span></h5>
      <h5>SGST (9%): ₹<span id="cart-sgst">${sgst.toFixed(2)}</span></h5>
      <h5>CGST (9%): ₹<span id="cart-cgst">${cgst.toFixed(2)}</span></h5>
    `;

    // Append dynamic details to the cart
    $("#cart-details").append(cartDetails);
  }

  // Update the cart view based on whether there are items or not
  function updateCartView() {
    if ($("#order").children().length === 0) {
      $("#order").html("<h3>Your cart is empty.</h3>");
      $("#cart-details").empty(); // Clear cart details when cart is empty
    } else {
     
      updateCartTotal(); // Ensure total is updated if there are items
    }
  }

  // Show success modal when "Order" button is clicked
  $("#order_btn").click(function () {
    // Reset cart after order is placed
    $("#order").empty();
    $("#cart_item_count").text(0);

    // Show success modal
    $("#orderSuccessModal").modal("show"); // Show the modal
  });
});

// Register User
document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.querySelector(
    '.form-container button[type="submit"]'
  );
  if (registerForm) {
    registerForm.addEventListener("click", function (event) {
      event.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const mobileno = document.getElementById("mobileno").value;
      const address = document.getElementById("address").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirm-password").value;

      if (
        !name ||
        !email ||
        !password ||
        !confirmPassword ||
        !mobileno ||
        !address
      ) {
        alert("All fields are required!");
        return;
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      const user = { name, email, password, mobileno, address };
      let users = JSON.parse(localStorage.getItem("users")) || [];
      const existingUser = users.find((u) => u.email === email);

      if (existingUser) {
        alert("User already exists. Please log in.");
        return;
      }

      users.push(user);
      localStorage.setItem("users", JSON.stringify(users));
      window.location.href = "index.html";
    });
  }

  // Login User
  const loginForm = document.querySelector(
    '.form-container button[type="submit"]'
  );
  if (loginForm) {
    loginForm.addEventListener("click", function (event) {
      event.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      if (!email || !password) {
        alert("Email and password are required!");
        return;
      }

      const users = JSON.parse(localStorage.getItem("users")) || [];
      const user = users.find(
        (u) => u.email === email && u.password === password
      );

      if (!user) {
        alert("Invalid credentials!");
        return;
      }

      localStorage.setItem("loggedInUser", JSON.stringify(user));
      window.location.href = "index.html";
    });
  }

  // Update Navbar for Logged-in User
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const navbarUserBtn = document.getElementById("sign-in-button");

  if (loggedInUser) {
    navbarUserBtn.innerHTML = `
        
          <i class="fa fa-lg fa-user"></i>
          <span class="ms-2">${loggedInUser.name}</span>
       
        <button id="logout-btn" class="btn btn-outline-danger ms-2">Logout</button>
      `;

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("loggedInUser");
        window.location.href = "index.html";
      });
    }
  } else {
    navbarUserBtn.innerHTML = `
        <a href="login.html" style="text-decoration: none; color: black;">
          <i class="fa fa-lg fa-user"></i>
          <span class="ms-2">Sign In</span>
        </a>
      `;
  }
});