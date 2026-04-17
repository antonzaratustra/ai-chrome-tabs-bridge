# Chrome Tabs Bridge

Это расширение и локальный bridge для управления живым Chrome.

Что оно делает:

- читает все окна Chrome;
- читает все вкладки и tab groups;
- отправляет состояние в локальный HTTP bridge;
- принимает команды на вкладки и окна;
- может выполнять команды вроде `focus_window`, `activate_tab`, `close_tab`, `move_tab`, `group_tabs`, `ungroup_tabs`, `rename_group`.

## Как запустить bridge

1. Открой терминал.
2. Перейди в папку расширения.
3. Запусти:

```bash
python3 /Users/antonzaratustra/Desktop/chrome-tabs-inspector/bridge.py
```

Если хочешь хранить state и queue в другой папке, можно добавить `--root`.

## Как загрузить расширение

1. Открой `chrome://extensions`
2. Включи `Developer mode`
3. Нажми `Load unpacked`
4. Выбери папку `/Users/antonzaratustra/Desktop/chrome-tabs-inspector`

## Как проверить, что все живо

```bash
curl http://127.0.0.1:8765/health
curl http://127.0.0.1:8765/state
```

## Как отправить команду

Пример: сфокусировать последнее активное окно.

```bash
curl -X POST http://127.0.0.1:8765/command \
  -H 'Content-Type: application/json' \
  -d '{"action":"focus_window"}'
```

Пример: закрыть вкладку.

```bash
curl -X POST http://127.0.0.1:8765/command \
  -H 'Content-Type: application/json' \
  -d '{"action":"close_tab","tabId":123}'
```

## Как пользоваться из popup

- `Синхронизировать сейчас` пинает Chrome и сразу отправляет state в bridge.
- `Загрузить state` показывает сохраненное состояние из bridge.
- `Команда JSON` позволяет вручную отправить любую команду в очередь.
