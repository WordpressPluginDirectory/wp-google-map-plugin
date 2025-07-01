<?php
/**
 * This class used to manage settings page in backend.
 *
 * @author Flipper Code <hello@flippercode.com>
 * @version 1.0.0
 * @package Maps
 */

$wpgmp_settings = get_option( 'wpgmp_settings', true );

$form = new WPGMP_Template();
$form->set_header( esc_html__( 'General Setting(s)', 'wp-google-map-plugin' ), $response, $enable = true );

$form->add_element(
	'group', 'gerenal_settings', array(
		'value'  => esc_html__( 'General Setting(s)', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link' => 'https://www.wpmapspro.com/docs/get-a-google-maps-api-key/'
	)
);
$form->add_element(
	'radio', 'wpgmp_map_source', array(
		'label'           => esc_html__( 'Map Provider', 'wp-google-map-plugin' ),
		'radio-val-label' => array(
			'google'     => esc_html__( 'Google Maps', 'wp-google-map-plugin' ),
			'openstreet' => esc_html__( 'OpenStreetMap', 'wp-google-map-plugin' ),
		),
		'current'         => isset($wpgmp_settings['wpgmp_map_source']) ? $wpgmp_settings['wpgmp_map_source'] : "google",
		'class'           => 'chkbox_class switch_onoff',
		'data'  		  => array( 'target' => '.wpgmp_map_type' ),
		'desc' => esc_html__('Select the map provider you want to use for rendering your maps.','wp-google-map-plugin'),
		'default_value'   => 'google',
	)
);

$tiles_providers = array(
	'OpenStreetMap.Mapnik'       => esc_html__( 'OpenStreetMap Mapnik', 'wp-google-map-plugin' ),
	'Stamen.Toner'               => esc_html__( 'Stamen Toner', 'wp-google-map-plugin' ),
	'Stamen.Terrain'             => esc_html__( 'Stamen Terrain', 'wp-google-map-plugin' ),
	'CartoDB.Positron'           => esc_html__( 'CartoDB Positron', 'wp-google-map-plugin' ),
	'CartoDB.DarkMatter'         => esc_html__( 'CartoDB Dark Matter', 'wp-google-map-plugin' ),
	'Esri.WorldImagery'          => esc_html__( 'Esri World Imagery', 'wp-google-map-plugin' ),
	'MapBox'          => esc_html__( 'MapBox', 'wp-google-map-plugin' ),
);

$form->add_element(
	'select', 'wpgmp_tiles_source', array(
		'label'   => esc_html__( 'Tiles Provider', 'wp-google-map-plugin' ),
		'current' => isset($wpgmp_settings['wpgmp_tiles_source']) ? $wpgmp_settings['wpgmp_tiles_source'] : 'OpenStreetMap.Mapnik',
		'desc'    => esc_html__( 'Choose your tiles provider.', 'wp-google-map-plugin' ),
		'options' => $tiles_providers,
		'before'  => '<div class="fc-6">',
		'class'   => 'form-control switch_onoff wpgmp_map_type wpgmp_map_type_openstreet',
		'data'  		  => array( 'target' => '.wpgmp_tiles_source' ),
		'after'   => '</div>',
	)
);

$form->add_element(
	'radio',
	'wpgmp_router_source',
	array(
		'label'           => esc_html__( 'Directions Provider', 'wp-google-map-plugin' ),
		'radio-val-label' => array(
			'openstreet' => esc_html__( 'OpenStreetMap (OSRM)', 'wp-google-map-plugin' ),
			'mapbox'     => esc_html__( 'Mapbox Directions API', 'wp-google-map-plugin' ),
		),
		'current'         => isset( $wpgmp_settings['wpgmp_router_source'] ) ? $wpgmp_settings['wpgmp_router_source'] : 'openstreet',
		'default_value'   => 'openstreet',
		'class'           => 'chkbox_class wpgmp_map_type wpgmp_map_type_openstreet wpgmp_map_type_mapbox',
		'desc'            => esc_html__( 'Select the routing provider for drawing routes and calculating directions.', 'wp-google-map-plugin' ),
		'pro' => true
	)
);

$referrer = home_url();
$referrer_two = '*'.$_SERVER['HTTP_HOST'].'/*';

$form->add_element(
	'message',
	'wpgmp_api_key_instructions',
	array(
		'value' => esc_html__('The very first step to get started with Google Maps is to create the right API key for your website. While creating the Google Maps API keys from the Google Cloud Platform, in the key restriction section, you need to choose HTTP referrer and then you will need to enter HTTP referrer according to your website domain name.', 'wp-google-map-plugin') . '<br><br>' . esc_html__('You will need to enter any one of the below HTTP referrer during the key creation process :   ', 'wp-google-map-plugin') . '<br><br><b><span class="wpgmp_referrer">'.$referrer. '</span></b>&nbsp;&nbsp;&nbsp;&nbsp; <input type="hidden" id="wpgmp_referrer_with_dot" value="'.$referrer.'" class="referrer_to_create"> <span class="tooltip"><span class="copy_to_clipboard referrer_to_copy"><img src="'. WPGMP_IMAGES. '/copy-to-clipboard.png">  <span class="tooltiptext" id="with_dot_tooltip">'.esc_html__('Copy HTTP Referrer To Clipboard','wp-google-map-plugin').'</span></span></span>&nbsp;&nbsp;&nbsp;&nbsp;'.esc_html__('( Works for most websites )','wp-google-map-plugin').'<br><br><b><span class="wpgmp_referrer">'.$referrer_two. ' </span></b>&nbsp;&nbsp;&nbsp;&nbsp; <input type="hidden" class="referrer_to_create" id="wpgmp_referrer_without_dot" value="'.$referrer_two.'"> <span class="tooltip"><span class="copy_to_clipboard referrer_to_copy"><img src="'. WPGMP_IMAGES. '/copy-to-clipboard.png">  <span class="tooltiptext" id="without_dot_tooltip">'.esc_html__('Copy HTTP Referrer To Clipboard','wp-google-map-plugin').'</span></span></span>&nbsp;&nbsp;&nbsp;&nbsp;'.esc_html__('( Try this if above doesn\'t work )','wp-google-map-plugin').'<br><br><a href="https://www.wpmapspro.com/docs/get-a-google-maps-api-key/" target="_blank">'.esc_html__('View Tutorial','wp-google-map-plugin').'</a>',
		'class' => 'fc-alert fc-alert-info wpgmp_api_key_instructions wpgmp_map_type wpgmp_map_type_google',
		'show'  => 'true',
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
	)
);

$form->set_col( 2 );

$key_url = 'https://www.wpmapspro.com/docs/get-a-google-maps-api-key/';

$link = '<a href="https://www.wpmapspro.com/docs/get-a-google-maps-api-key/" target="_blank">'.esc_html__("View Instructions","wp-google-map").'</a>'; 

$form->add_element(
	'text', 'wpgmp_api_key', array(
		'label'  => esc_html__( 'Google Maps API Key', 'wp-google-map-plugin' ),
		'value'  => isset($wpgmp_settings['wpgmp_api_key']) ? $wpgmp_settings['wpgmp_api_key'] : "",
		'before' => '<div class="fc-6"> <div class="wpgmp_apitest"></div>',
		'after'  => '</div>',
		'class' => 'fc-form-control wpgmp_map_type wpgmp_map_type_google',
		'desc'   => sprintf(esc_html__( '%1$s for your website.', 'wp-google-map-plugin' ), $link)
	)
);


if ( !isset($wpgmp_settings['wpgmp_api_key']) || $wpgmp_settings['wpgmp_api_key'] == '' ) {

	$generate_link = '<a href="https://www.wpmapspro.com/docs/get-a-google-maps-api-key/" class="wpgmp_map_key_missing wpgmp_key_btn fc-btn fc-btn-default btn-lg" target="_blank" >' . esc_html__( 'Generate API Key', 'wp-google-map-plugin' ) . '</a>';

	$form->add_element(
		'html', 'wpgmp_key_btn', array(
			'html'   => $generate_link,
			'before' => '<div class="fc-2">',
			'after'  => '</div>',
			'class' => 'fc-form-control wpgmp_map_type wpgmp_map_type_google',

		)
	);


} else {

	$generate_link = '<a href="javascript:void(0);" class="wpgmp_check_key fc-btn fc-btn-default btn-lg" >' . esc_html__( 'Test API Key', 'wp-google-map-plugin' ) . '</a>';

	$form->add_element(
		'html', 'wpgmp_key_btn', array(
			'html'   => $generate_link,
			'before' => '<div class="fc-2">',
			'after'  => '</div>',
			'class' => 'form-control wpgmp_map_type wpgmp_map_type_google',
		)
	);

}


$form->set_col( 1 );



$language = array(
	'en'    => esc_html__( 'ENGLISH', 'wp-google-map-plugin' ),
	'ar'    => esc_html__( 'ARABIC', 'wp-google-map-plugin' ),
	'eu'    => esc_html__( 'BASQUE', 'wp-google-map-plugin' ),
	'bg'    => esc_html__( 'BULGARIAN', 'wp-google-map-plugin' ),
	'bn'    => esc_html__( 'BENGALI', 'wp-google-map-plugin' ),
	'ca'    => esc_html__( 'CATALAN', 'wp-google-map-plugin' ),
	'cs'    => esc_html__( 'CZECH', 'wp-google-map-plugin' ),
	'da'    => esc_html__( 'DANISH', 'wp-google-map-plugin' ),
	'de'    => esc_html__( 'GERMAN', 'wp-google-map-plugin' ),
	'el'    => esc_html__( 'GREEK', 'wp-google-map-plugin' ),
	'en-AU' => esc_html__( 'ENGLISH (AUSTRALIAN)', 'wp-google-map-plugin' ),
	'en-GB' => esc_html__( 'ENGLISH (GREAT BRITAIN)', 'wp-google-map-plugin' ),
	'es'    => esc_html__( 'SPANISH', 'wp-google-map-plugin' ),
	'fa'    => esc_html__( 'FARSI', 'wp-google-map-plugin' ),
	'fi'    => esc_html__( 'FINNISH', 'wp-google-map-plugin' ),
	'fil'   => esc_html__( 'FILIPINO', 'wp-google-map-plugin' ),
	'fr'    => esc_html__( 'FRENCH', 'wp-google-map-plugin' ),
	'gl'    => esc_html__( 'GALICIAN', 'wp-google-map-plugin' ),
	'gu'    => esc_html__( 'GUJARATI', 'wp-google-map-plugin' ),
	'hi'    => esc_html__( 'HINDI', 'wp-google-map-plugin' ),
	'hr'    => esc_html__( 'CROATIAN', 'wp-google-map-plugin' ),
	'hu'    => esc_html__( 'HUNGARIAN', 'wp-google-map-plugin' ),
	'id'    => esc_html__( 'INDONESIAN', 'wp-google-map-plugin' ),
	'it'    => esc_html__( 'ITALIAN', 'wp-google-map-plugin' ),
	'iw'    => esc_html__( 'HEBREW', 'wp-google-map-plugin' ),
	'ja'    => esc_html__( 'JAPANESE', 'wp-google-map-plugin' ),
	'kn'    => esc_html__( 'KANNADA', 'wp-google-map-plugin' ),
	'ko'    => esc_html__( 'KOREAN', 'wp-google-map-plugin' ),
	'lt'    => esc_html__( 'LITHUANIAN', 'wp-google-map-plugin' ),
	'lv'    => esc_html__( 'LATVIAN', 'wp-google-map-plugin' ),
	'ml'    => esc_html__( 'MALAYALAM', 'wp-google-map-plugin' ),
	'it'    => esc_html__( 'ITALIAN', 'wp-google-map-plugin' ),
	'mr'    => esc_html__( 'MARATHI', 'wp-google-map-plugin' ),
	'nl'    => esc_html__( 'DUTCH', 'wp-google-map-plugin' ),
	'no'    => esc_html__( 'NORWEGIAN', 'wp-google-map-plugin' ),
	'pl'    => esc_html__( 'POLISH', 'wp-google-map-plugin' ),
	'pt'    => esc_html__( 'PORTUGUESE', 'wp-google-map-plugin' ),
	'pt-BR' => esc_html__( 'PORTUGUESE (BRAZIL)', 'wp-google-map-plugin' ),
	'pt-PT' => esc_html__( 'PORTUGUESE (PORTUGAL)', 'wp-google-map-plugin' ),
	'ro'    => esc_html__( 'ROMANIAN', 'wp-google-map-plugin' ),
	'ru'    => esc_html__( 'RUSSIAN', 'wp-google-map-plugin' ),
	'sk'    => esc_html__( 'SLOVAK', 'wp-google-map-plugin' ),
	'sl'    => esc_html__( 'SLOVENIAN', 'wp-google-map-plugin' ),
	'sr'    => esc_html__( 'SERBIAN', 'wp-google-map-plugin' ),
	'sv'    => esc_html__( 'SWEDISH', 'wp-google-map-plugin' ),
	'tl'    => esc_html__( 'TAGALOG', 'wp-google-map-plugin' ),
	'ta'    => esc_html__( 'TAMIL', 'wp-google-map-plugin' ),
	'te'    => esc_html__( 'TELUGU', 'wp-google-map-plugin' ),
	'th'    => esc_html__( 'THAI', 'wp-google-map-plugin' ),
	'tr'    => esc_html__( 'TURKISH', 'wp-google-map-plugin' ),
	'uk'    => esc_html__( 'UKRAINIAN', 'wp-google-map-plugin' ),
	'vi'    => esc_html__( 'VIETNAMESE', 'wp-google-map-plugin' ),
	'zh-CN' => esc_html__( 'CHINESE (SIMPLIFIED)', 'wp-google-map-plugin' ),
	'zh-TW' => esc_html__( 'CHINESE (TRADITIONAL)', 'wp-google-map-plugin' ),
);

$form->add_element(
	'select', 'wpgmp_language', array(
		'label'   => esc_html__( 'Map Language', 'wp-google-map-plugin' ),
		'current' => isset($wpgmp_settings['wpgmp_language']) ? $wpgmp_settings['wpgmp_language'] : 'en',
		'desc'    => esc_html__( 'Choose your language for map. Default is English.', 'wp-google-map-plugin' ),
		'options' => $language,
		'before'  => '<div class="fc-6">',
		'class'   => 'form-control wpgmp_map_type wpgmp_map_type_google',
		'after'   => '</div>',
	)
);

	$form->add_element(
		'text', 'wpgmp_mapbox_key', array(
			'label'  => esc_html__( 'MapBox API Key', 'wp-leaflet-maps-pro' ),
			'value'  => isset($wpgmp_settings['wpgmp_mapbox_key']) ? $wpgmp_settings['wpgmp_mapbox_key'] : "",
			'before' => '<div class="fc-4">',
			'after'  => '</div>',
			'class'   => 'form-control wpgmp_map_type wpgmp_map_type_openstreet',
			'desc' => sprintf( esc_html__( 'Create a %s API key and paste in above textbox.', 'wp-leaflet-maps-pro' ), '<a target="_blank" href="https://www.mapbox.com/account/access-tokens">'.esc_html__(' MapBox ','wp-leaflet-maps-pro').' </a>' ),
			'show' => 'false',
		)
	);

$guide_link = '<a href="https://www.wpmapspro.com/category/maps-error-codes/" target="_blank">'.esc_html__("guides.",'wp-google-map-plugin').'</a>'; 

$form->add_element(
	'html', 'wpgmp_map_preview', array(
		'label' => 'Map Preview',
		'class' => 'form-control',
		'html'   => "<div id='wpgmp_map_preview' style='width:100%;height:300px'></div>",
		'desc'   => sprintf(esc_html__( 'If Google Maps is not visible then please check the error by clicking Test API Key button above and fix using our %1$s', 'wp-google-map-plugin' ), $guide_link)
	)
);


$form->add_element(
	'radio', 'wpgmp_scripts_place', array(
		'label'           => esc_html__( 'Include Scripts in ', 'wp-google-map-plugin' ),
		'radio-val-label' => array(
			'header' => esc_html__( 'Header', 'wp-google-map-plugin' ),
			'footer' => esc_html__( 'Footer (Recommended)', 'wp-google-map-plugin' ),
		),
		'current'         => isset($wpgmp_settings['wpgmp_scripts_place']) ? $wpgmp_settings['wpgmp_scripts_place'] : "footer",
		'class'           => 'chkbox_class',
		'default_value'   => 'footer',
	)
);

$form->add_element(
	'radio', 'wpgmp_scripts_minify', array(
		'label'           => esc_html__( 'Minify Scripts', 'wp-google-map-plugin' ),
		'radio-val-label' => array(
			'yes' => esc_html__( 'Yes', 'wp-google-map-plugin' ),
			'no' => esc_html__( 'No', 'wp-google-map-plugin' ),
		),
		'current'         => isset($wpgmp_settings['wpgmp_scripts_minify']) ? $wpgmp_settings['wpgmp_scripts_minify'] : "yes",
		'class'           => 'chkbox_class',
		'default_value'   => 'yes',
	)
);

$form->add_element(
	'checkbox', 'wpgmp_country_specific', array(
		'label'         => esc_html__( 'Enable Country Restriction', 'wp-google-map-plugin' ),
		'value'         => 'true',
		'current'       => isset( $wpgmp_settings['wpgmp_country_specific'] ) ? $wpgmp_settings['wpgmp_country_specific'] : '',
		'desc'          => esc_html__( 'Apply country restriction on search results & autosuggestions.', 'wp-google-map-plugin' ),
		'class'         => 'chkbox_class switch_onoff',
		'data'          => array( 'target' => '.enable_retrict_countries' ),
		'default_value' => 'false',
		'pro'			=> true,
	)
);
		
		$countries = "Afghanistan,AF
Albania,AL
Algeria,DZ
American Samoa,AS
Andorra,AD
Angola,AO
Anguilla,AI
Antarctica,AQ
Antigua and Barbuda,AG
Argentina,AR
Armenia,AM
Aruba,AW
Australia,AU
Austria,AT
Azerbaijan,AZ
Bahamas,BS
Bahrain,BH
Bangladesh,BD
Barbados,BB
Belarus,BY
Belgium,BE
Belize,BZ
Benin,BJ
Bermuda,BM
Bhutan,BT
Bosnia and Herzegovina,BA
Botswana,BW
Bouvet Island,BV
Brazil,BR
British Indian Ocean Territory,IO
Brunei Darussalam,BN
Bulgaria,BG
Burkina Faso,BF
Burundi,BI
Cambodia,KH
Cameroon,CM
Canada,CA
Cape Verde,CV
Cayman Islands,KY
Central African Republic,CF
Chad,TD
Chile,CL
China,CN
Christmas Island,CX
Cocos (Keeling) Islands,CC
Colombia,CO
Comoros,KM
Congo,CG
Cook Islands,CK
Costa Rica,CR
Croatia,HR
Cuba,CU
CuraÃ§ao,CW
Cyprus,CY
Czech Republic,CZ
Denmark,DK
Djibouti,DJ
Dominica,DM
Dominican Republic,DO
Ecuador,EC
Egypt,EG
El Salvador,SV
Equatorial Guinea,GQ
Eritrea,ER
Estonia,EE
Ethiopia,ET
Falkland Islands (Malvinas),FK
Faroe Islands,FO
Fiji,FJ
Finland,FI
France,FR
French Guiana,GF
French Polynesia,PF
French Southern Territories,TF
Gabon,GA
Gambia,GM
Georgia,GE
Germany,DE
Ghana,GH
Gibraltar,GI
Greece,GR
Greenland,GL
Grenada,GD
Guadeloupe,GP
Guam,GU
Guatemala,GT
Guernsey,GG
Guinea,GN
Guinea-Bissau,GW
Guyana,GY
Haiti,HT
Heard Island and McDonald Islands,HM
Holy See (Vatican City State),VA
Honduras,HN
Hong Kong,HK
Hungary,HU
Iceland,IS
India,IN
Indonesia,ID
Iran,IR
Iraq,IQ
Ireland,IE
Isle of Man,IM
Israel,IL
Italy,IT
Jamaica,JM
Japan,JP
Jersey,JE
Jordan,JO
Kazakhstan,KZ
Kenya,KE
Kiribati,KI
Korea, Democratic People's Republic of,KP
Korea, Republic of,KR
Kuwait,KW
Kyrgyzstan,KG
Lao People's Democratic Republic,LA
Latvia,LV
Lebanon,LB
Lesotho,LS
Liberia,LR
Libya,LY
Liechtenstein,LI
Lithuania,LT
Luxembourg,LU
Macao,MO
Macedonia,MK
Madagascar,MG
Malawi,MW
Malaysia,MY
Maldives,MV
Mali,ML
Malta,MT
Marshall Islands,MH
Martinique,MQ
Mauritania,MR
Mauritius,MU
Mayotte,YT
Mexico,MX
Micronesia,FM
Moldova,MD
Monaco,MC
Mongolia,MN
Montenegro,ME
Montserrat,MS
Morocco,MA
Mozambique,MZ
Myanmar,MM
Namibia,NA
Nauru,NR
Nepal,NP
Netherlands,NL
New Caledonia,NC
New Zealand,NZ
Nicaragua,NI
Niger,NE
Nigeria,NG
Niue,NU
Norfolk Island,NF
Northern Mariana Islands,MP
Norway,NO
Oman,OM
Pakistan,PK
Palau,PW
Palestine,PS
Panama,PA
Papua New Guinea,PG
Paraguay,PY
Peru,PE
Philippines,PH
Pitcairn,PN
Poland,PL
Portugal,PT
Puerto Rico,PR
Qatar,QA
RÃ©union,RE
Romania,RO
Russian Federation,RU
Rwanda,RW
Saint Kitts and Nevis,KN
Saint Lucia,LC
Saint Martin (French part),MF
Saint Pierre and Miquelon,PM
Saint Vincent and the Grenadines,VC
Samoa,WS
San Marino,SM
Sao Tome and Principe,ST
Saudi Arabia,SA
Senegal,SN
Serbia,RS
Seychelles,SC
Sierra Leone,SL
Singapore,SG
Sint Maarten,SX
Slovakia,SK
Slovenia,SI
Solomon Islands,SB
Somalia,SO
South Africa,ZA
South Georgia and the South Sandwich Islands,GS
South Sudan,SS
Spain,ES
Sri Lanka,LK
Sudan,SD
Suriname,SR
Svalbard and Jan Mayen,SJ
Swaziland,SZ
Sweden,SE
Switzerland,CH
Syrian Arab Republic,SY
Taiwan,TW
Tajikistan,TJ
Tanzania,TZ
Thailand,TH
Timor-Leste,TL
Togo,TG
Tokelau,TK
Tonga,TO
Trinidad and Tobago,TT
Tunisia,TN
Turkey,TR
Turkmenistan,TM
Turks and Caicos Islands,TC
Tuvalu,TV
Uganda,UG
Ukraine,UA
United Arab Emirates,AE
United Kingdom,GB
United States,US
United States Minor Outlying Islands,UM
Uruguay,UY
Uzbekistan,UZ
Vanuatu,VU
Venezuela,VE
Viet Nam,VN
Virgin Islands, British,VG
Virgin Islands, U.S.,VI
Wallis and Futuna,WF
Western Sahara,EH
Yemen,YE
Zambia,ZM
Zimbabwe,ZW";

$countrieslist = explode("\n", $countries);

$newchoose_continent = array();

foreach($countrieslist as $country) {

	$country = explode(",", $country);
	$newchoose_continent[] = array(
				 'id'   => trim($country[count($country) -1 ]),
				 'text' => trim($country[0]),
			 );
}

if( isset($wpgmp_settings['wpgmp_countries']) ) {
$selected_restricted_countries = $wpgmp_settings['wpgmp_countries'];	
} else {
$selected_restricted_countries = array();
}

$form->add_element(
'category_selector', 'wpgmp_countries', array(
	'label'    => esc_html__( 'Choose Countries', 'wp-google-map-plugin' ),
	'data'     => $newchoose_continent,
	'current'  => ( isset( $selected_restricted_countries ) and ! empty( $selected_restricted_countries ) ) ? $selected_restricted_countries : array(),
	'desc'     => esc_html__( 'Select the countries where location suggestions should be limited.', 'wp-google-map-plugin' ),

	'class'    => 'enable_retrict_countries',
	'before'   => '<div class="fc-8">',
	'after'    => '</div>',
	'multiple' => 'true',
	'show'     => 'false',
)
);

$form->add_element(
'group', 'location_metabox_settings', array(
	'value'  => esc_html__( 'Meta Box Settings', 'wp-google-map-plugin' ),
	'before' => '<div class="fc-12">',
	'after'  => '</div>',
	'tutorial_link' => 'https://www.wpmapspro.com/docs/how-to-hide-metabox-from-post-and-pages/',
	'pro' => true,
)
);



$form->add_element(
	'html',
	'wpgmp_metabox_msg',
	array(
		'html' => WPGMP_Helper::wpgmp_instructions('metabox'),
		'show'  => 'true',
		'before' => '<div class="fc-7">',
		'after'  => '</div>',
	)
);

$form->add_element(
'group', 'location_extra_fields', array(
	'value'  => esc_html__( 'Create Extra Field(s)', 'wp-google-map-plugin' ),
	'before' => '<div class="fc-12">',
	'after'  => '</div>',
	'tutorial_link' => 'https://www.wpmapspro.com/docs/how-to-create-extra-fields-for-location-infowindow-2/',
	'pro' => true
)
);

$form->add_element(
	'html',
	'wpgmp_extra_fields_msg',
	array(
		'html' => WPGMP_Helper::wpgmp_instructions('extra_fields'),
		'show'  => 'true',
		'before' => '<div class="fc-7">',
		'after'  => '</div>',
	)
);

$form->add_element(
	'group', 'map_troubleshooting', array(
		'value'  => esc_html__( 'Troubleshooting', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link' => 'https://www.wpmapspro.com/docs/what-to-do-when-google-maps-is-not-visible/'
	)
);

$form->add_element(
	'checkbox', 'wpgmp_auto_fix', array(
		'label'   => esc_html__( 'Auto Fix', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'current' => isset($wpgmp_settings['wpgmp_auto_fix']) ? $wpgmp_settings['wpgmp_auto_fix'] : '',
		'desc'    => esc_html__( 'If map is not visible somehow, turn on auto fix and check the map.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class',
	)
);


$form->add_element(
	'checkbox', 'wpgmp_debug_mode', array(
		'label'   => esc_html__( 'Turn On Debug Mode', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'current' => isset($wpgmp_settings['wpgmp_debug_mode']) ? $wpgmp_settings['wpgmp_debug_mode'] : '',
		'desc'    => esc_html__( 'If map is not visible somehow even auto fix in turned on, please turn on debug mode and contact support team to analysis javascript console output.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class',
	)
);

$form->add_element(
	'checkbox', 'wpgmp_hide_notification', array(
		'label'   => esc_html__( 'Hide Notifications', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'current' => isset($wpgmp_settings['wpgmp_hide_notification']) ? $wpgmp_settings['wpgmp_hide_notification'] : '',
		'desc'    => esc_html__( 'Turn off notifications. You may miss new plugin updates notifications.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class',
	)
);

$form->add_element(
	'checkbox', 'wpgmp_advanced_marker', array(
		'label'   => esc_html__( 'Use Advanced Marker', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'current' => isset($wpgmp_settings['wpgmp_advanced_marker']) ? $wpgmp_settings['wpgmp_advanced_marker'] : '',
		'desc'    => esc_html__( 'Use advanced html marker instead of native markers.', 'wp-google-map-plugin' ),
		'class'   => 'chkbox_class',
	)
);

$form->add_element(
    'text',
    'wpgmp_set_timeout',
    array(
        'label'  => esc_html__( 'Execution Delay (ms)', 'wp-google-map-plugin' ),
        'value'  => isset( $wpgmp_settings['wpgmp_set_timeout'] ) ? $wpgmp_settings['wpgmp_set_timeout'] : '100',
        'before' => '<div class="fc-6"><div class="wpgmp_apitest"></div>',
        'after'  => '</div>',
        'class'  => 'fc-form-control',
        'desc'   => esc_html__( 'Set a delay (0–1000 ms) if the map fails to load immediately.', 'wp-google-map-plugin' ),
    )
);

$form->add_element(
	'group', 'map_gdpr', array(
		'value'  => esc_html__( 'Cookies Acceptance', 'wp-google-map-plugin' ),
		'before' => '<div class="fc-12">',
		'after'  => '</div>',
		'tutorial_link' => 'https://www.wpmapspro.com/topic/cookies/'
	)
);

$form->add_element(
	'checkbox', 'wpgmp_gdpr', array(
		'label'   => esc_html__( 'Enable Cookies Acceptance', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'desc'    => esc_html__( 'Maps will remain hidden until the visitor accepts the cookie policy. This feature is intended for developers who wish to monitor cookies access and limit map access.', 'wp-google-map-plugin' ),
		'current' => isset($wpgmp_settings['wpgmp_gdpr']) ? $wpgmp_settings['wpgmp_gdpr'] : "",
		'class'   => 'chkbox_class',
	)
);

$form->add_element(
	'textarea', 'wpgmp_gdpr_msg', array(
		'label'                => esc_html__( '"No Map" Notice', 'wp-google-map-plugin' ),
		'desc'                 => esc_html__( 'Show message instead of map until visitor accept the cookies policy. HTML Tags are allowed. Leave it blank for no message.', 'wp-google-map-plugin' ),
		'value'                => isset($wpgmp_settings['wpgmp_gdpr_msg']) ? $wpgmp_settings['wpgmp_gdpr_msg'] : esc_html__( 'Please accept cookies to show google maps.', 'wp-google-map-plugin' ),
		'textarea_fc-dividers' => 10,
		'textarea_name'        => 'wpgmp_gdpr_msg',
		'class'                => 'form-control wpgmp_gdpr_setting',
	)
);

$form->add_element(
	'checkbox', 'wpgmp_gdpr_show_placeholder', array(
		'label'   => esc_html__( 'Show Placeholder', 'wp-google-map-plugin' ),
		'value'   => 'true',
		'desc'    => esc_html__( 'Until you accept cookies, show a map image along with a consent message in place of Google Maps', 'wp-google-map-plugin' ),
		'current' => isset($wpgmp_settings['wpgmp_gdpr_show_placeholder']) ? $wpgmp_settings['wpgmp_gdpr_show_placeholder'] : "",
		'class'   => 'chkbox_class',
	)
);

$form->add_element(	'hidden', 'wpgmp_version', array( 'value' => WPGMP_VERSION )	);

$form->add_element(
	'submit', 'wpgmp_save_settings', array(
		'value' => esc_html__( 'Save Settings', 'wp-google-map-plugin' ),
	)
);
$form->add_element(
	'hidden', 'operation', array(
		'value' => 'save',
	)
);
$form->add_element(
	'hidden', 'page_options', array(
		'value' => 'wpgmp_api_key,wpgmp_scripts_place',
	)
);

$form->render();
$map_data['map_options'] = array(
	'center_lat' =>  '',
	'center_lng' =>  '',
	'tiles_provider' => WPGMP_Helper::wpgmp_get_leaflet_provider()
);

$map_data['provider'] = WPGMP_Helper::wpgmp_get_map_provider();
$map_data['map_property'] = array('map_id' => 1);
?>
<script type="text/javascript">
/**
 
jQuery(document).ready(function($) {
var map = $("#wpgmp_map_preview").maps("<?php echo base64_encode(wp_json_encode( $map_data )); ?>").data('wpgmp_maps');
});

 */
</script>

<script type="text/javascript">
document.addEventListener("wpgmpReady", function () {

  jQuery(function ($) {

    const map = $("#wpgmp_map_preview")
      .maps("<?php echo base64_encode(wp_json_encode($map_data)); ?>")
      .data("wpgmp_maps");

    console.log("✅ Map initialized", map);
  });
});
</script>