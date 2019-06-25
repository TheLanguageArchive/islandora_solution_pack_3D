<?php
/**
 * Fetch DAE from current object or it's siblings
 */
class DaeFetcher
{
    /**
     * @var IslandoraFedoraObject
     */
    private $object;

    /**
     * @var IslandoraFedoraObject[]
     */
    private $siblings;

    /**
     * @var array
     */
    private $textures;

    /**
     * @var array
     */
    private $images;

    /**
     * Constructor
     *
     * @param AbstractObject $object
     */
    public function __construct(AbstractObject $object)
    {
        $this->object = $object;
    }

    /**
     * @return IslandoraFedoraDatastream
     */
    public function getDatastream()
    {
        $datastream  = $this->object->getDatastream('OBJ');
        $daeDetected = ($datastream && in_array($datastream->mimetype, array('model/vnd.collada+xml', 'application/collada-zipped')) && islandora_datastream_access(ISLANDORA_VIEW_OBJECTS, $datastream));

        $siblings = $this->getSiblings();

        foreach ($siblings as $sibling) {

            if (!$daeDetected) {

                // current object is not DAE
                // let's get it from siblings
                // TODO: what to do in the unlikely event that we have both DAE and ZAE siblings?
                if ($sibling['obj'] && in_array($sibling['obj']->mimetype, array('model/vnd.collada+xml', 'application/collada-zipped'))) {
                    $datastream = $sibling['obj'];
                }
            }
        }

        return $datastream;
    }

    /**
     * @return IslandoraFedoraObject[]
     */
    public function getSiblings()
    {
        if (null === $this->siblings) {

            $data = islandora_compound_object_retrieve_compound_info($this->object);

            $this->siblings = [];

            if (isset($data['siblings_detailed']) && count($data['siblings_detailed']) > 0) {

                foreach ($data['siblings_detailed'] as $pid => $sibling) {

                    $this->siblings[$pid]['title']  = $sibling['title'];
                    $this->siblings[$pid]['object'] = islandora_object_load($sibling['pid']);
                    $this->siblings[$pid]['obj']    = $this->siblings[$pid]['object']->getDatastream('OBJ');
                }
            }
        }

        return $this->siblings;
    }

    /**
     * @return array
     */
    public function getTextures()
    {
        if (null === $this->textures) {

            $this->textures = [];
            $siblings = $this->getSiblings();

            foreach ($siblings as $sibling) {

                if ($sibling['obj'] && islandora_datastream_access(ISLANDORA_VIEW_OBJECTS, $sibling['obj'])) {
                    $this->textures[$sibling['title']] = url('islandora/object/' . $sibling['object']->id . '/datastream/OBJ/view');
                }
            }
        }

        return $this->textures;
    }
}
