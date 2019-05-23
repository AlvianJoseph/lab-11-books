
$(document).ready(function () {
    $(".seeMore").click(function() {
        $(this).parent().find('#form').toggle('.hide');
        console.log(this);
    })
});