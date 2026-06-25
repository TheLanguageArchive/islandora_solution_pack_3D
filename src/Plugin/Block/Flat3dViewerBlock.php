<?php

namespace Drupal\flat_3d_viewer\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\node\Entity\Node;
use Drupal\node\NodeInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides the FLAT 3D Viewer as a placeable block.
 *
 * Renders the viewer for the node in the current route, so it can be placed via
 * the Block layout or Layout Builder on node displays.
 *
 * @Block(
 *   id = "flat_3d_viewer",
 *   admin_label = @Translation("FLAT 3D Viewer"),
 *   category = @Translation("Islandora"),
 * )
 */
class Flat3dViewerBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * The current route match.
   *
   * @var \Drupal\Core\Routing\RouteMatchInterface
   */
  protected RouteMatchInterface $routeMatch;

  /**
   * {@inheritdoc}
   *
   * @param array<string, mixed> $configuration
   *   The plugin configuration.
   * @param string $plugin_id
   *   The plugin ID.
   * @param mixed $plugin_definition
   *   The plugin definition.
   */
  public function __construct(array $configuration, string $plugin_id, mixed $plugin_definition, RouteMatchInterface $route_match) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->routeMatch = $route_match;
  }

  /**
   * {@inheritdoc}
   *
   * @param array<string, mixed> $configuration
   *   The plugin configuration.
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): static {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('current_route_match'),
    );
  }

  /**
   * {@inheritdoc}
   */
  /**
   * {@inheritdoc}
   *
   * @return array<string, mixed>
   *   The default plugin configuration.
   */
  public function defaultConfiguration(): array {
    return [
      'height' => '600px',
      'background' => '#eeeeee',
    ] + parent::defaultConfiguration();
  }

  /**
   * {@inheritdoc}
   */
  /**
   * {@inheritdoc}
   *
   * @param array<string, mixed> $form
   *   The block configuration form.
   *
   * @return array<string, mixed>
   *   The form array.
   */
  public function blockForm($form, FormStateInterface $form_state): array {
    $form['height'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Height'),
      '#default_value' => $this->configuration['height'],
    ];
    $form['background'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Background color'),
      '#description' => $this->t('Hexadecimal color code (e.g. #eeeeee).'),
      '#default_value' => $this->configuration['background'],
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  /**
   * {@inheritdoc}
   *
   * @param array<string, mixed> $form
   *   The submitted form array.
   */
  public function blockSubmit($form, FormStateInterface $form_state): void {
    $this->configuration['height'] = $form_state->getValue('height');
    $this->configuration['background'] = $form_state->getValue('background');
  }

  /**
   * {@inheritdoc}
   */
  /**
   * {@inheritdoc}
   *
   * @return array<string, mixed>
   *   A render array.
   */
  public function build(): array {
    $build = [
      '#cache' => [
        'contexts' => ['route'],
      ],
    ];

    $node = $this->routeMatch->getParameter('node');
    if (is_numeric($node)) {
      $node = Node::load($node);
    }
    if (!$node instanceof NodeInterface) {
      return $build;
    }

    $build['#cache']['tags'] = ['node:' . $node->id()];

    $viewer = _flat_3d_viewer_build_viewer($node, [
      'height' => $this->configuration['height'],
      'background' => $this->configuration['background'],
    ]);
    if ($viewer) {
      $build['viewer'] = $viewer;
    }

    return $build;
  }

}
