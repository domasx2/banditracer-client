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
               'alias':['24px maass', '#333333'],  //ingame multiplayer player alias
               '16_33':['16px maass', '#333333'],
               'alias_label':['40px maass', '#FFFFFF'],
               'button':['25px maass', '#000'],
               'loading':['40px maass', '#351A15'],
               '40_black':['40px maass', '#000'],
               '13_grayish':['13px maass', '#383736'],
               'sp_btn':['34px maass', '#FFF'],
               'header_black':['56px maass', '#333333'],
               'header_brown':['56px maass', '#A67C52'],
               'editor_ai_wp':['19px maass', '#0094FF'],
               'editor_checkpoint':['19px maass', '#FF5656'],
               'editor_start_pos':['19px maass', '#3AFF51']
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
