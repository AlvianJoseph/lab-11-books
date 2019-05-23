
$(document).ready(function () {
    $(".seeMore").click(function() {
        $(this).parent().find('p').toggle('descriptionOn');
        console.log(this);
    })
});