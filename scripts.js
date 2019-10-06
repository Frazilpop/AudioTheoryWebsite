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
