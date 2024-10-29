<?php
// Breadcrumb.php
$breadcrumbItems = isset($breadcrumbItems) ? $breadcrumbItems : [];

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
