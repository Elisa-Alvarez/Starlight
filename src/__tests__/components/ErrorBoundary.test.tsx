import React from 'react';
import { create, act, ReactTestRenderer } from 'react-test-renderer';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { Text } from 'react-native';

function ProblemChild(): JSX.Element {
  throw new Error('Test error');
}

function GoodChild(): JSX.Element {
  return <Text>All good</Text>;
}

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  (console.error as jest.Mock).mockRestore();
  (console.warn as jest.Mock).mockRestore();
});

describe('ErrorBoundary', () => {
  it('renders children when no error', async () => {
    let tree: ReactTestRenderer;
    await act(async () => {
      tree = create(
        <ErrorBoundary>
          <GoodChild />
        </ErrorBoundary>,
      );
    });

    expect(tree!.root.findByType(Text).props.children).toBe('All good');
  });

  it('shows fallback on child error', async () => {
    let tree: ReactTestRenderer;
    await act(async () => {
      tree = create(
        <ErrorBoundary>
          <ProblemChild />
        </ErrorBoundary>,
      );
    });

    const texts = tree!.root.findAllByType(Text);
    const textContents = texts.map((t) => t.props.children);
    expect(textContents).toContain('Something went wrong');
  });

  it('resets error state on retry', async () => {
    let tree: ReactTestRenderer;
    await act(async () => {
      tree = create(
        <ErrorBoundary>
          <ProblemChild />
        </ErrorBoundary>,
      );
    });

    const texts = tree!.root.findAllByType(Text);
    expect(texts.some((t) => t.props.children === 'Something went wrong')).toBe(true);
  });
});
