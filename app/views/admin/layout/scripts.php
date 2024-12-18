<!-- Scripts -->
<script src="<?php echo URLSERVER; ?>public/templates/plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="<?php echo URLSERVER; ?>public/templates/dist/js/adminlte.js"></script>
<script>
    // Acción de pantalla completa
    document.getElementById('fullscreen-btn').addEventListener('click', function () {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });

    $(document).ready(function() {
        $('.main-sidebar').on('hide.bs.sidebar', function () {
            $('.nav-treeview').slideUp(); // Cerrar todos los submenús
            $('.nav-item').removeClass('menu-open'); // Eliminar la clase 'menu-open' para cerrar los elementos
        });

        // Asegurarse de que los submenús se cierren al hacer clic en un enlace de menú
        $('.nav-link').on('click', function() {
            var $parent = $(this).parent();
            if ($parent.hasClass('menu-open')) {
                $parent.removeClass('menu-open');
                $parent.find('.nav-treeview').slideUp();
            } else {
                $('.nav-item.menu-open').removeClass('menu-open').find('.nav-treeview').slideUp();
                $parent.addClass('menu-open');
                $parent.find('.nav-treeview').slideDown();
            }
        });
    });

    // Manejo de inactividad
    let inactivityTime = function () {
        let timeout;
        window.onload = resetTimer; // Resetea el temporizador si hay actividad
        window.onmousemove = resetTimer;
        window.onkeypress = resetTimer;

        function logout() {
            // Redirigir a lockscreen
            window.location.href = "<?php echo URLSERVER; ?>login/lockscreen.php";
        }

        function resetTimer() {
            clearTimeout(timeout);
            timeout = setTimeout(logout, 300000); // 5 minutos en milisegundos
        }
    };

    inactivityTime(); // Llamar a la función
</script>
</body>
</html>
