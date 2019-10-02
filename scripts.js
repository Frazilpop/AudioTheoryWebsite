window.onscroll = function() {staticHeader()};

var header = document.getElementById("staticHeader");

var sticky = header.offsetTop;

function staticHeader() {
  if (window.pageYOffset > sticky) {
    header.classList.add("sticky");
  } else {
    header.classList.remove("sticky");
  }
} 