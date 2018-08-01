<?php
/**
 * @file
 * Handles the uploading of 3D files.
 */

/**
 * Defines the 3D file upload form.
 *
 * @param array $form       Drupal form definition
 * @param array $form_state Drupal form state
 *
 * @return array Drupal form definition
 */
function islandora_sp_3d_3d_upload(array $form, array &$form_state) {

    $upload_size     = min((int) ini_get('post_max_size'), (int) ini_get('upload_max_filesize'));
    $extensions      = ['dae fbx OSGB'];
    $upload_required = variable_get('islandora_require_obj_upload', true);

    return [

        'file' => [

            '#title'             => t('3D object'),
            '#type'              => 'managed_file',
            '#required'          => $upload_required,
            '#description'       => t('Select 3D object to upload.<br />Files must be less than <strong>@size MB.</strong><br />Allowed file types: <strong>@ext.</strong>', [

                '@size' => $upload_size,
                '@ext'  => $extensions[0]
            ]),
            '#default_value'     => isset($form_state['values']['files']) ? $form_state['values']['files'] : null,
            '#upload_location'   => 'temporary://',
            '#upload_validators' => [

                'file_validate_extensions' => $extensions,
                'file_validate_size'       => [$upload_size * 1024 * 1024],
            ],
        ],
    ];
}

/**
 * Submit form handler
 *
 * @param array $form       Drupal form definition
 * @param array $form_state Drupal form state
 *
 * @return array Drupal form definition
 */
function islandora_sp_3d_3d_upload_submit($form, &$form_state) {

    $object = islandora_ingest_form_get_object($form_state);

    if ($form_state['values']['file']) {

        $file       = file_load($form_state['values']['file']);
        $path       = drupal_realpath($file->uri);
        $extension  = pathinfo($file->origname, PATHINFO_EXTENSION);
        $datastream = $object->getDatastream('OBJ');

        if (!$datastream) {

            $datastream = $object->constructDatastream('OBJ', 'M');
            $object->ingestDatastream($datastream);

            $object->label = $file->filename;
        }

        $datastream->label    = $file->filename;
        $datastream->mimetype = $file->filemime;
        $datastream->setContentFromFile($path, false);
    }
}
