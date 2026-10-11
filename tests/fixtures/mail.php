<?php
if (getenv('VILLA_FORM_TEST_RESULT') === 'throw') throw new RuntimeException('Fixture exception');
if ($fields['fname'] === 'Fixture exception') throw new RuntimeException('Fixture exception');
if ($fields['fname'] === 'Fixture failure') return false;
if (strpos($htmlContent, '<script>') !== false) throw new RuntimeException('Unescaped form content');
return getenv('VILLA_FORM_TEST_RESULT') !== 'fail';
