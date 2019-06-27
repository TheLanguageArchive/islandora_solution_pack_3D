<?php

/**
 * @file
 * Handles the display/submission of the admin settings form for this module.
 */

/**
 * Defines the admin settings form.
 *
 * @param array $form       Drupal form definition
 * @param array $form_state Drupal form state
 *
 * @return array Drupal form definition
 */
function islandora_sp_3d_admin(array $form, array &$form_state) {

    return system_settings_form([

        'actions' => [

            '#type' => 'actions',
            'reset' => [

                '#type'   => 'submit',
                '#value'  => t('Reset to defaults'),
                '#weight' => 1,
                '#submit' => ['islandora_sp_3d_admin_submit'],
            ],
        ],

        'general' => [

            '#type'        => 'fieldset',
            '#title'       => t('General'),
            '#collapsible' => false,
            '#collapsed'   => false,

            'islandora_sp_3d_width' => [

                '#type'          => 'textfield',
                '#title'         => t('Viewer maximum width'),
                '#description'   => t('Maximum width of the 3D Viewer in pixels'),
                '#default_value' => variable_get('islandora_sp_3d_width', 690),
            ],

            'islandora_sp_3d_background' => [

                '#type'          => 'textfield',
                '#title'         => t('Viewer background colour'),
                '#description'   => t('Background colour of the 3D Viewer in html hex colour format (e.g. #FFFFFF for white)'),
                '#default_value' => variable_get('islandora_sp_3d_background', '#C8E0FF'),
            ],

'islandora_sp_3d_scale' => [

                '#type'          => 'textfield',
                '#title'         => t('Scale value'),
                '#description'   => t('Sets the initial scaling of the 3D scene. A larger value result in larger objects.'),
                '#default_value' => variable_get('islandora_sp_3d_scale', '1'),
            ],

'islandora_sp_3d_minDistance' => [

                '#type'          => 'textfield',
                '#title'         => t('Mimimum zoom distance'),
                '#description'   => t('Sets the minimum zoom distance when using mouse or touch controls. A smaller value allows for zooming in more.'),
                '#default_value' => variable_get('islandora_sp_3d_minDistance', '0.5'),
            ],

'islandora_sp_3d_maxDistance' => [

                '#type'          => 'textfield',
                '#title'         => t('Maximum zoom distance'),
                '#description'   => t('Sets the maximum zoom distance when using mouse or touch controls. A larger value allows for zooming out more.'),
                '#default_value' => variable_get('islandora_sp_3d_maxDistance', '250'),
            ],
        ],
    ]);
}

/**
 * Submit form handler
 *
 * @param array $form       Drupal form definition
 * @param array $form_state Drupal form state
 *
 * @return array Drupal form definition
 */
function islandora_sp_3d_admin_submit($form, &$form_state) {

    $op = $form_state['clicked_button']['#id'];
    switch ($op) {

        case 'edit-reset':

            variable_del('islandora_sp_3d_width');
            variable_del('islandora_sp_3d_background');
            variable_del('islandora_sp_3d_scale');
            variable_del('islandora_sp_3d_minDistance');
            variable_del('islandora_sp_3d_maxDistance');

            drupal_set_message('The configuration options were successfully reset');

            break;
    }
}

/**
 * Form validation
 *
 * @param array $form       Drupal form definition
 * @param array $form_state Drupal form state
 *
 * @return array Drupal form definition
 */
function islandora_sp_3d_admin_validate($form, &$form_state) {

    $op = $form_state['clicked_button']['#id'];
    if ($op === 'edit-reset') {
        return;
    }

    if (intval($form_state['values']['islandora_sp_3d_width']) <= 0) {
        form_set_error('islandora_sp_3d_width', 'Please provide a correct maximum width value (positive integer)');
    }

    if (floatval($form_state['values']['islandora_sp_3d_scale']) <= 0) {
        form_set_error('islandora_sp_3d_scale', 'Please provide a correct scale value (positive decimal)');
    }

    if (floatval($form_state['values']['islandora_sp_3d_minDistance']) < 0) {
        form_set_error('islandora_sp_3d_minDistance', 'Please provide a correct minimum distance value (decimal 0 or larger)');
    }

    if (floatval($form_state['values']['islandora_sp_3d_maxDistance']) <= 0) {
        form_set_error('islandora_sp_3d_maxDistance', 'Please provide a correct maximum distance value (positive decimal)');
    }

    if (!preg_match('/#([a-f0-9]{3}){1,2}\b/i', $form_state['values']['islandora_sp_3d_background'])) {
        form_set_error('islandora_sp_3d_background', 'Please provide a correct hex color in the form of #fff or #ffffff');
    }
}
