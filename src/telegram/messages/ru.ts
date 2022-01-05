const messagesInRussian = {
  LIST_RECENT: {
    TITLE:
      'Вот список из <strong>20</strong> самых популярных крипт на сегодня!\n\n',
    FAVORITE: '<strong>Вот список ваших избранных крипт:</strong>\n\n',
    MAIN_INFO: '/{symbol} {price}\n',
  },
  CURRENT_CURRENCY: {
    TITLE: '<strong>Подробная информация об криптовалюте</strong>\n\n',
    MAIN_INFO:
      'Криптавалюта <strong>{symbol}</strong> (<strong>{name}</strong>).\nСтатус: <strong>{is_active}</strong>.\n\n',
    SUPLY:
      'Примерное количество монет в обращении: <strong>{circulating_supply}</strong>.\nПримерное общее количетсво монет, существующих на данный момент: <strong>{total_supply}</strong>.\nОжидаемый максимальный когда-либо доступный лимит монет: <strong>{max_supply}</strong>.\n\n',
    QUOTE:
      'Цена за одну монету в доларах: <strong>{price}</strong>.\nОбъем перемещений монеты за 24-часа: <strong>{volume_24h}</strong>.\nИзменение объема перемещения монеты за последние 24 часа: <strong>{volume_change_24h}</strong>.\nИзменение стоимости монеты за последний час: <strong>{percent_change_1h}</strong>.\nИзменение стоимости монеты за последниe 24 часа: <strong>{percent_change_24h}</strong>.\nИзменение стоимости монеты за последние 7 дней: <strong>{percent_change_7d}</strong>.\nИзменение стоимости монеты за последние 30 дней: <strong>{percent_change_30d}</strong>.\nИзменение стоимости монеты за последние 60 дней: <strong>{percent_change_60d}</strong>.\nИзменение стоимости монеты за последние 90 дней: <strong>{percent_change_90d}</strong>.\nРыночная капитализация: <strong>{market_cap}</strong>.\nДоминирование рыночной капитализации в долларах: <strong>{market_cap_dominance}</strong>.\n',
    BUTTON: {
      ADD: 'Добавить в избранное',
      REMOVE: 'Убрать из избранного',
    },
    NOTICE: {
      ADD: 'Криптовалюта (<strong>{symbol}</strong>) успешно добавлена в избранное!',
      REMOVE:
        'Криптовалюта (<strong>{symbol}</strong>) успешно удалена из избранного!',
    },
  },
  START:
    'Привет, спасибо что воспользовался нашим ботом! Благодаря нам ты сможешь легко отслеживать статистику самых популярных крипт! Используй /help для просмотра актуальных команд!',
  HELP: {
    START: '/start - приветствие прекрасного тебя!\n',
    HELP: '/help - краткое описание возможностей нашего бота!\n',
    LIST_RECENT: '/listrecent - cписок из 20 самых популярных крипт!\n',
    LIST_FAVORITE: '/listfavorite - cписок твоих избранных крипт!\n',
    ADD_TO_FAVORITE:
      '/addtofavorite <strong>BTC</strong> - добавляет криптовалюту в ваш список избранного (<strong>BTC</strong> - пример, вместо нее может быть любая другая крипта в краткой записи)!\n',
    DELETE_FAVORITE:
      '/deletefavorite <strong>BTC</strong> - удаляет криптовалюту из вашего списка избранного (<strong>BTC</strong> - пример, вместо нее может быть любая другая крипта в краткой записи)!\n',
  },
  ERROR: {
    INCORRECT_COMMAND: 'Нам очень жаль, но наш бот не знает такую команду(',
    INVALID_SYMBOL:
      'Нам очень жаль, но как мы не рылись в наших чертогах разума мы не смогли найти криптовалюты с таким названием!',
    DEFAULT:
      'Нам очень жаль но что-то пошло не так! Напиши нам на <strong>example@gmail.com</strong> и мы обязательно это исправим!',
    EMPTY_FAVORITE:
      'Оу, кажется вы еще не добавили ни одну крипту в избранное!',
    CRYPTOCURRENCY_ALREADY_EXIST:
      'Оу, кажется криптовалюта (<strong>{symbol}</strong>) уже добавлена в ваш список избранного!',
    NOTHING_TO_DELETE_IN_FAVORITE:
      'Оу, мы не можем убрать криптовалюту (<strong>{symbol}</strong>) из вашего списка избранного, ее там и так нет!',
  },
};

export default messagesInRussian;
