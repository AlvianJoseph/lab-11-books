
$(document).ready(function () {
    $(".seeMore").click(function() {
        $(this).parent().find('form').toggle('.hide');
        $(this).parent().find('.book').toggle();
        console.log($(this).parent());
    })
});