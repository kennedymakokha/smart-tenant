import React from 'react';
import { View, Text } from 'react-native';
import { spacing, fonts } from './../../theme';

const Section = ({ title, children }: any) => (
    <View style={{ marginBottom: spacing.lg }}>
        <Text style={fonts.title}>{title}</Text>
        <View style={{ marginTop: spacing.sm }}>{children}</View>
    </View>
);

export default Section;
