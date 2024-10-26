<?php
// Asegúrate de que se pase el array de elementos del breadcrumb a esta vista
$breadcrumbItems = isset($breadcrumbItems) ? $breadcrumbItems : [];

// Agregar una clase CSS opcional para el breadcrumb activo
$activeClass = 'active';
?>

<nav aria-label="breadcrumb">
    <ol class="breadcrumb">
        <?php foreach ($breadcrumbItems as $index => $item): ?>
            <li class="breadcrumb-item <?php echo $index === count($breadcrumbItems) - 1 ? $activeClass : ''; ?>">
                <?php if ($index === count($breadcrumbItems) - 1): ?>
                    <!-- Último elemento sin enlace -->
                    <?php echo htmlspecialchars($item['label']); ?>
                <?php else: ?>
                    <!-- Elementos anteriores como enlaces -->
                    <a href="<?php echo htmlspecialchars($item['url']); ?>"><?php echo htmlspecialchars($item['label']); ?></a>
                <?php endif; ?>
            </li>
        <?php endforeach; ?>
    </ol>
</nav>
