<?php

namespace Drupal\flat_3d_viewer\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Entity\EntityInterface;
use Drupal\media\MediaInterface;
use Drupal\node\NodeInterface;

/**
 * Plugin implementation of the 'three_js_viewer' formatter.
 *
 * @FieldFormatter(
 *   id = "three_js_viewer",
 *   label = @Translation("Three.js 3D Viewer"),
 *   field_types = {
 *     "file"
 *   }
 * )
 */
class ThreeJsViewerFormatter extends FormatterBase {

  /**
   * {@inheritdoc}
   */
  /**
   * {@inheritdoc}
   *
   * @return array<string, mixed>
   *   Default formatter settings.
   */
  public static function defaultSettings(): array {
    return [
      'width' => '100%',
      'height' => '500px',
      'background' => '#eeeeee',
    ] + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  /**
   * {@inheritdoc}
   *
   * @param array<string, mixed> $form
   *   The settings form.
   *
   * @return array<string, mixed>
   *   The settings form.
   */
  public function settingsForm(array $form, FormStateInterface $form_state): array {
    $element['width'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Width'),
      '#default_value' => $this->getSetting('width'),
    ];
    $element['height'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Height'),
      '#default_value' => $this->getSetting('height'),
    ];
    $element['background'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Background Color'),
      '#description' => $this->t('Hexadecimal color code (e.g., #eeeeee).'),
      '#default_value' => $this->getSetting('background'),
    ];
    return $element;
  }

  /**
   * {@inheritdoc}
   */
  /**
   * {@inheritdoc}
   *
   * @return array<int, \Drupal\Core\StringTranslation\TranslatableMarkup>
   *   Settings summary lines.
   */
  public function settingsSummary(): array {
    $summary = [];
    $summary[] = $this->t('Size: @width x @height', ['@width' => $this->getSetting('width'), '@height' => $this->getSetting('height')]);
    $summary[] = $this->t('Background: @bg', ['@bg' => $this->getSetting('background')]);
    return $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $elements = [];

    foreach ($items as $delta => $item) {
      if ($item->entity) {
        $file_url = \Drupal::service('file_url_generator')->generateAbsoluteString($item->entity->getFileUri());

        // Find textures on sibling objects of the node this media belongs to.
        $textures = $this->getTextures($items->getEntity());

        $elements[$delta] = [
          '#theme' => 'flat_3d_viewer',
          '#url' => $file_url,
          '#textures' => $textures,
          '#width' => $this->getSetting('width'),
          '#height' => $this->getSetting('height'),
          '#background' => $this->getSetting('background'),
          '#attached' => flat_3d_viewer_attachments($this->getSetting('background')),
        ];
      }
    }

    return $elements;
  }

  /**
   * Helper to get textures from sibling nodes.
   *
   * The formatter is placed on the file field of a Media entity, so we resolve
   * the node the media belongs to (via field_media_of) and reuse the module's
   * sibling-texture discovery.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   The entity the formatted field belongs to.
   *
   * @return array
   *   An array of texture URLs keyed by filename.
   */
  /**
   * @return array<string, string>
   *   Texture URLs keyed by filename.
   */
  protected function getTextures(EntityInterface $entity): array {
    $node = NULL;

    if ($entity instanceof MediaInterface
      && $entity->hasField('field_media_of')
      && !$entity->get('field_media_of')->isEmpty()) {
      $node = $entity->get('field_media_of')->entity;
    }
    elseif ($entity instanceof NodeInterface) {
      $node = $entity;
    }

    if ($node instanceof NodeInterface) {
      return _flat_3d_viewer_get_textures($node);
    }

    return [];
  }

}
