var modal = document.getElementById("modal-c");
var modalImg = document.getElementById("img01");
var body = document.body;

function openModal(img) {
  modal.style.display = "block";
  modalImg.src = img.src;
  body.classList.add("no-scroll");

}

var span = document.getElementsByClassName("close")[0];
var body = document.body;
span.onclick = function() {
  modal.style.display = "none";
  body.classList.remove("no-scroll");

}

$(function(){
  var includes = $('[data-include]');
  jQuery.each(includes, function(){
    var file = '/' + $(this).data('include') + '.html';
    $(this).load(file);
  });
});

$(".slick-slider").slick({
  dots: true,
  /*
    infinite: true,
    speed: 500,
    fade: true,
    cssEase: 'linear' */
});
$(".slick-slider-screen").slick({
  dots: false,
  speed: -1,

  /*
    infinite: true,
    fade: true,
    cssEase: 'linear' */
});
$(".slick-slider-single").slick({
  dots: true,
  slidesToShow: 4,
  slidesToScroll: 1,
  adaptiveHeight: false,
  responsive: [
    {
      breakpoint: 1200,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3,
        infinite: true,
        dots: true
      }
    },
    {
      breakpoint: 767,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2
      }
    },
    {
      breakpoint: 540,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1
      }
    }
    // You can unslick at a given breakpoint now by adding:
    // settings: "unslick"
    // instead of a settings object
  ]
});

$("#menu-toggle").click(function (e) {
  e.preventDefault();
  $("#wrapper").toggleClass("toggled");
});
$("#menu-toggle_c").click(function (e) {
  e.preventDefault();
  $("#wrapper").toggleClass("toggled");
});
var leftArrow = document.getElementsByClassName("slick-prev")[0];
var rightArrow = document.getElementsByClassName("slick-next")[0];
if (rightArrow != null) {
  rightArrow.onclick = function() {
    leftArrow.style.display = "block";
    leftArrow.style.setProperty('display', 'block', 'important');


  } 
}
var loadMoreContent = document.getElementsByClassName("load-more-content")[0];
var loadMoreButton = document.getElementsByClassName("load-more-button")[0];
if (loadMoreButton != null) {
  loadMoreButton.onclick = function() {
    loadMoreContent.style.display = "block";
    loadMoreButton.style.display = "none";

  }
}

$('.slick-slider-center').slick({
  centerMode: true,
  centerPadding: '10px',
  slidesToShow: 3,
  responsive: [
    {
      breakpoint: 768,
      settings: {
        arrows: false,
        centerMode: true,
        centerPadding: '40px',
        slidesToShow: 3
      }
    },
    {
      breakpoint: 480,
      settings: {
        arrows: false,
        centerMode: true,
        centerPadding: '40px',
        slidesToShow: 1
      }
    }
  ]
});

document.querySelectorAll('.promo-video-hover').forEach(function(el) {
    var video = el.querySelector('video');
    var videoActive = false;

    // Desktop: hover to play
    el.addEventListener('mouseenter', function() { video.currentTime = 0; video.play(); });
    el.addEventListener('mouseleave', function() { video.pause(); });

    // Mobile: first tap shows video, second tap navigates
    el.addEventListener('click', function(e) {
        if (window.matchMedia('(hover: none)').matches) {
            if (!videoActive) {
                e.preventDefault();
                video.style.opacity = '1';
                video.currentTime = 0;
                video.play();
                videoActive = true;
            }
        }
    });

    // Reset when tapping outside
    document.addEventListener('click', function(e) {
        if (videoActive && !el.contains(e.target)) {
            video.pause();
            video.style.opacity = '';
            videoActive = false;
        }
    });
});
		
