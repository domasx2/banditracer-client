exports.ui_header_background='#FFF';
exports.ui_background='#E6E6E6';

exports.alias_background='#333333';

exports.alert_box_border='black';
exports.alert_box_background='#E6E6E6';

//fonts name:[css description, color]
/*
exports.fonts={'hud':['30px "Showcard Gothic"', 'red'],         //in game hud
               'header':['40px Aharoni', '#351A15'],            //ui scene headers
               'default':['20px Aharoni', '#351A15'],           //labels, default if not specified
               'small_header':['bold 16px Arial', 'black'],     //table headers
               'small':['bold 14px Arial', 'black'],             //table cells
               'alias':['bold 14px Arial', '#4CFF00'],  //ingame multiplayer player alias
               'button':['20px Aharoni', '#351A15'],
               'loading':['40px Stencil', '#351A15']
               };
*/

exports.fonts={'hud':['30px maass', 'red'],         //in game hud
               'header':['40px maass', '#351A15'],            //ui scene headers
               'default':['20px maass', '#351A15'],           //labels, default if not specified
               'small_header':['16px maass', 'white'],     //table headers
               'small':['14px maass', 'black'],             //table cells
               'alias':['23px maass', '#333333'],  //ingame multiplayer player alias
               '16_33':['16px maass', '#333333'],
               '13_1a':['13px maass', '#1A1A1A'],
               'alias_label':['40px maass', '#FFFFFF'],
               'button':['25px maass', '#000'],
               'button2':['30px maass', '#333333'],
               'button2_hover':['30px maass', '#F2F2F2'],
               'loading':['40px maass', '#351A15'],
               '40_black':['40px maass', '#000'],
               '13_grayish':['13px maass', '#383736'],
               '25_66':['25px maass', '#666666'],
               'sp_btn':['34px maass', '#FFF'],
               'header_black':['56px maass', '#333333'],
               'header_brown':['56px maass', '#A67C52'],
               'editor_ai_wp':['19px maass', '#0094FF'],
               'editor_checkpoint':['19px maass', '#FF5656'],
               'editor_start_pos':['19px maass', '#3AFF51'],
               'g_white_title':['16px maass', '#F2F2F2']
               };


exports.single_player_scene={'background_color':'#C7B299'};

exports.dialog={'font':'default'};

exports.sp_car_display={'bg_color':'#998675',
                        'font1':'13_grayish',
                        'font2':'sp_btn'};

exports.garage_btn={'bg_color':'#CCCCCC',
                    'bg_color_hover':'#B3B3B3',
                    'label_bg':'#E6E6E6',
                    'font':'alias'};
                    
exports.track_selector={'back_color':'#E6E6E6',
                        'front_color':'#CCCCCC',
                        'item_hover_color':'#D8D8D8',
                        'item_font':'16_33'};

exports.title_button={'fill':'#CCCCCC',
                      'fill_hover':'#B3B3B3',
                      'font':'40_black'};

exports.sp_button={'fill':'#333333',
                    'fill_hover':'#000',
                    'font':'sp_btn'};
                      
exports.button={'border':'#282828',              //button border
                'font':'button',                 //default font
                'fill':'#CCCCCC',                 //default fill
                'hover_fill':'#B3B3B3',          //fill on hover
                'selected_fill':'#FF6A00'};       //fill when selected
                
exports.garage={'background_color':'#666666',
                'back_button':{'fill':'#E6E6E6',
                                'hover_fill':'#000',
                                'font':'button2',
                                'hover_font':'button2_hover'},
                'balance_background':'#E6E6E6',
                'car_title_background':'#333333',
                'car_background':'#CCCCCC',
                'car_title_font':'g_white_title',
                'balance_font':'alias',
                'weapon_info_title_background':'#F5F5F5',
                'weapon_info_background':'#B3B3B3',
                'weapon_label_font':'16_33',
                'weapon_info_text_font':'13_1a',
                'tuning_title_background':'#4D4D4D',
                'tuning_background':'#1A1A1A',
                'store_background':'#F2F2F2',
                'store_border':'#CCCCCC',
                'selected_shop_item_bg':'#B3B3B3',
                'slot_border':'rgba(204, 204, 204, 0.5)',
                'slot_bg':'rgba(204, 204, 204, 0.8)',
                'slot_bg_selected':'#777777',
                'slot_path':'#CCCCCC',
                'white_button':{'bg':'#F2F2F2',
                                'bg_hover':'#1A1A1A',
                                'font':'16_33',
                                'hover_font':'g_white_title'}};
                

exports.trackdisplay={'font':'16_33'};

//label
exports.label={'font':'default'};

//textbox
exports.textbox={'font':'default',
                 'border':'#282828',
                 'background':'#FFEFAA'};


//table
exports.table={'header_font':'small_header',
                'data_font':'small',
                'border':'#C6A500',
                'header_fill':'#333333',         //header row background
                'hover_fill':'#FFBE00',          //fill on row hover
                'body_fill':'#CCCCCC',
                'selected_fill':'#FF6A00'};           //my english fails me. its the line between rows

//track info display
exports.trackinfodisplay={'header_font':'default',
                          'outline_color':'#808080'};
