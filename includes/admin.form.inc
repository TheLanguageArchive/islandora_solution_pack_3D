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
                '#title'         => t('Provide maximum width of 3D viewer'),
                '#description'   => t('You can provide the maximum width of the Islandora Solution Pack 3D Viewer'),
                '#default_value' => variable_get('islandora_sp_3d_width', 690),
            ],

            'islandora_sp_3d_background' => [

                '#type'          => 'textfield',
                '#title'         => t('Provide background of 3D viewer'),
                '#description'   => t('You can provide the background color of the Islandora Solution Pack 3D Viewer in html hex color format (e.g. #FFFFFF for white)'),
                '#default_value' => variable_get('islandora_sp_3d_background', '#C8E0FF'),
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

            drupal_set_message('The configuration options were successfully resetted');

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
        form_set_error('islandora_sp_3d_width', 'Please provide a correct maximum width and make sure it is greater than 0');
    }

    if (!preg_match('/#([a-f0-9]{3}){1,2}\b/i', $form_state['values']['islandora_sp_3d_background'])) {
        form_set_error('islandora_sp_3d_background', 'Please provide a correct hex color in the form of #fff or #ffffff');
    }
}
